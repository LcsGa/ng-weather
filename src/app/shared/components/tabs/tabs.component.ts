import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, ContentChildren, QueryList, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { TabComponent } from "./tab.component";
import { distinct } from "../../../shared/utils";

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  selector: "app-tabs",
  styles: `
    nav {
      display: inline-flex;
      flex-wrap: wrap;
    }

    button {
      flex-grow: 1;
      display: inline-flex;
      justify-content: space-between;
      column-gap: 8px;
      padding: 8px 12px;
      border: none;
      border-block: 2px solid transparent;
      border-radius: 0;

      &:hover {
        background-color: #ddd;
      }

      &.active {
        border-bottom-color: #337ab7;
      }
    }
  `,
  template: `
    <nav>
      @for (tab of _tabs(); track tab.id) {
        <button [class.active]="tab.id === activeTabId()" (click)="setActiveTab(tab.id)">
          <span>{{ tab.label }}</span>

          <span class="close" (click)="removeTab(tab.id)">&times;</span>
        </button>
      }
    </nav>

    @if (activeTab(); as activeTab) {
      <div>
        <ng-container *ngTemplateOutlet="activeTab.templateRef" />
      </div>
    }
  `,
})
export class TabsComponent {
  readonly _tabs = signal<TabComponent[]>([]);

  // Here we use a Subject to prevent ExpressionChangedAfterItHasBeenCheckedError
  readonly #activeTabId$ = new Subject<string | undefined>();

  readonly activeTabId = toSignal(this.#activeTabId$);

  readonly activeTab = toSignal(this.#activeTabId$.pipe(map((id) => this._tabs().find((tab) => tab.id === id))));

  @ContentChildren(TabComponent)
  set tabs(tabs: QueryList<TabComponent>) {
    const distinctTabs = distinct(tabs.toArray(), ({ id }) => id);
    this._tabs.set(distinctTabs);
    this.#activeTabId$.next(distinctTabs[0]?.id);
  }

  setActiveTab(id: TabComponent['id']) {
    this.#activeTabId$.next(id);
  }

  removeTab(id: string) {
    this.#emitClosingTab(id);

    this._tabs.update((tabs) => tabs.filter((tab) => tab.id !== id));
    this.#activeTabId$.next(this._tabs()[0]?.id);
  }

  #emitClosingTab(id: string) {
    const removedTab = this._tabs().find((tab) => tab.id === id);
    removedTab.close.emit(id);
  }
}
