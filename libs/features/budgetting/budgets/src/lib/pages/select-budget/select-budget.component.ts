import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, combineLatest, map, shareReplay } from 'rxjs';
import { cloneDeep as ___cloneDeep } from 'lodash';

import { Logger } from '@iote/bricks-angular';
import { Budget, BudgetRecord, BudgetStatus } from '@app/model/finance/planning/budgets';
import { BudgetsStore, OrgBudgetsStore } from '@app/state/finance/budgetting/budgets';
import { CreateBudgetModalComponent } from '../../components/create-budget-modal/create-budget-modal.component';

@Component({
  selector: 'app-select-budget',
  templateUrl: './select-budget.component.html',
  styleUrls: ['./select-budget.component.scss', '../../components/budget-view-styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectBudgetPageComponent implements OnInit {
  budgetsForTable$!: Observable<{ overview: BudgetRecord[]; budgets: any[] }>;

  constructor(
    private _orgBudgets$$: OrgBudgetsStore,
    private _budgets$$: BudgetsStore,
    private _dialog: MatDialog,
    private _logger: Logger
  ) {}

  ngOnInit() {
    const overview$ = this._orgBudgets$$.get().pipe(shareReplay(1));
    const sharedBudgets$ = this._budgets$$.get().pipe(shareReplay(1));

    this.budgetsForTable$ = combineLatest([overview$, sharedBudgets$]).pipe(
      map(([overview, shared]) => ({
        overview: (overview as any).flat?.() ?? overview,
        budgets: (shared as any).flat?.() ?? shared
      })),
      map(({ overview, budgets }) => ({
        overview,
        budgets: budgets.map((b: any) => ({
          ...b,
          endYear: b.startYear + b.duration - 1
        }))
      })),
      shareReplay(1)
    );
  }

  openDialog(parent: Budget | false): void {
    this._dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent || null
    });
  }

  canPromote(record: BudgetRecord) {
    return (record.budget as any).canBeActivated;
  }

  setActive(record: BudgetRecord) {
    const toSave = ___cloneDeep(record.budget);
    delete (toSave as any).canBeActivated;
    delete (toSave as any).access;
    toSave.status = BudgetStatus.InUse;

    (record as any).updating = true;
    this._budgets$$.update(toSave).subscribe(() => {
      (record as any).updating = false;
      this._logger.log(() => `Budget ${toSave.id} is now active`);
    });
  }
}