import { Routes } from "@angular/router";
import { ReportListComponent } from "./report-list/report-list";
import { ReportDetailComponent } from "./report-detail/report-detail";

export const reportRoutes: Routes = [
  { path: '', component: ReportListComponent},
  { path: ':id', component: ReportDetailComponent },
];