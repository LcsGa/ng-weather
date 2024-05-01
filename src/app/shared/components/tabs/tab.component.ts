import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from "@angular/core";

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-tab",
  template: `<ng-template #template><ng-content /></ng-template>`,
})
export class TabComponent {
  static id = 0;

  @Input() id = `tab-${TabComponent.id++}`;

  @Input({ required: true }) label = "";

  @Output() readonly close = new EventEmitter<TabComponent["id"]>();

  @ViewChild("template", { read: TemplateRef })
  readonly templateRef: TemplateRef<any>;
}
