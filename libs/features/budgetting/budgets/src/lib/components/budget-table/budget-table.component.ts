import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Budget, BudgetRecord } from '@app/model/finance/planning/budgets';
import { ShareBudgetModalComponent } from '../share-budget-modal/share-budget-modal.component';
import { CreateBudgetModalComponent } from '../create-budget-modal/create-budget-modal.component';
import { ChildBudgetsModalComponent } from '../../modals/child-budgets-modal/child-budgets-modal.component';

@Component({
  selector: 'app-budget-table',
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetTableComponent {
  @Input() budgets$!: Observable<{ overview: BudgetRecord[]; budgets: any[] }>;
  @Input() canPromote = false;

  @Output() doPromote = new EventEmitter<void>();

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns = ['name', 'status', 'startYear', 'duration', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  overviewBudgets: BudgetRecord[] = [];

  constructor(private _router: Router, private _dialog: MatDialog) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  filterAccountRecords(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  promote() {
    if (this.canPromote) this.doPromote.emit();
  }

  openShareBudgetDialog(parent: Budget | false): void {
    this._dialog.open(ShareBudgetModalComponent, {
      width: '600px',
      panelClass: 'no-pad-dialog',
      data: parent || null
    });
  }

  openCloneBudgetDialog(parent: Budget | false): void {
    this._dialog.open(CreateBudgetModalComponent, {
      width: '600px',
      height: 'fit-content',
      data: parent || null
    });
  }

  openChildBudgetDialog(parent: Budget): void {
    const children = this.overviewBudgets
      .find(b => b.budget.id === parent.id)?.children?.map((c: any) => c.budget) ?? [];

    this._dialog.open(ChildBudgetsModalComponent, {
      minWidth: '600px',
      height: 'fit-content',
      data: { parent, budgets: children }
    });
  }

  goToDetail(budgetId: string, action: string) {
    this._router.navigate(['budgets', budgetId, action]).then(() => this._dialog.closeAll());
  }

  translateStatus(status: number): string {
    const map: Record<number, string> = {
      1: 'BUDGET.STATUS.ACTIVE',
      0: 'BUDGET.STATUS.DESIGN',
      9: 'BUDGET.STATUS.NO-USE',
      '-1': 'BUDGET.STATUS.DELETED'
    };
    return map[status] ?? '';
  }

  access(_: string) { return true; }
}