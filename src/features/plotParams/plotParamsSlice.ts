import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export enum AddPrinMode {
	STATIC = 'STATIC',
	PRIN_PERCENT = 'PRIN_PERCENT',
	PMT_PERCENT = 'PMT_PERCENT'
}

// Add cmpToBase boolean flag
export interface PlotParams {
	balance: number,
	intRate: number,
	remMoPmt: number,
	addPrinMode: AddPrinMode,
	addPrinPct: number,
	addPrinAmt: number,
	cmpToBase: boolean,
}

const initialState: PlotParams = {
	balance: 300000,
	intRate: 3.25,
	remMoPmt: 360,
	addPrinMode: AddPrinMode.PRIN_PERCENT,
	addPrinPct: 0,
	addPrinAmt: 0,
	cmpToBase: false,
};

export const plotParamsSlice = createSlice({
	name: 'plotParams',
	initialState,
	reducers: {
		setBalance: (state, action: PayloadAction<number>) => {
			state.balance = action.payload;
		},
		setIntRate: (state, action: PayloadAction<number>) => {
			state.intRate = action.payload;
		},
		setRemMoPmts: (state, action: PayloadAction<number>) => {
			state.remMoPmt = action.payload;
		},
		setAddPrinMode: (state, action: PayloadAction<AddPrinMode>) => {
			state.addPrinMode = action.payload;
		},
		setAddPrinPct: (state, action: PayloadAction<number>) => {
			state.addPrinPct = action.payload;
		},
		setAddPrinAmt: (state, action: PayloadAction<number>) => {
			state.addPrinAmt = action.payload;
		},
		setCmpToBase: (state, action: PayloadAction<boolean>) => {
			state.cmpToBase = action.payload;
		},
	}
});

export const {
	setBalance,
	setIntRate,
	setRemMoPmts,
	setAddPrinMode,
	setAddPrinPct,
	setAddPrinAmt,
	setCmpToBase,
} = plotParamsSlice.actions;

export const selectPlotParams = (state: RootState) => state.plotParams;

export const selectBalance = (state: RootState) => state.plotParams.balance;

export const selectIntRate = (state: RootState) => state.plotParams.intRate;

export const selectRemMoPmts = (state: RootState) => state.plotParams.remMoPmt;

export const selectPrinMode = (state: RootState) => state.plotParams.addPrinMode;

export const selectPrinPct = (state: RootState) => state.plotParams.addPrinPct;

export const selectPrinAmt = (state: RootState) => state.plotParams.addPrinAmt;

export const selectCmpToBase = (state: RootState) => state.plotParams.cmpToBase;

export const selectMinMonthlyPmt = (state: RootState) => {
	const params = state.plotParams;
	const moInt = params.intRate / 100 / 12;
	return params.balance * (moInt * Math.pow(moInt + 1, params.remMoPmt)) / (Math.pow(1 + moInt, params.remMoPmt) - 1)
}

export interface PmtValues {
	startBalance: number,
	endBalance: number,
	principal: number,
	interest: number
}

function assessAddlPrincipal(basePmtVals: PmtValues, params: PlotParams): PmtValues {
	const addlPmt = Object.assign({}, basePmtVals);

	let addlPrin = 0;
	if (params.addPrinMode === AddPrinMode.STATIC) {
		addlPrin = params.addPrinAmt;
	} else if (params.addPrinMode === AddPrinMode.PRIN_PERCENT) {
		addlPrin = ((params.addPrinPct / 100) * basePmtVals.principal)
	} else if (params.addPrinMode === AddPrinMode.PMT_PERCENT) {
		addlPrin = ((params.addPrinPct / 100) * (basePmtVals.principal + basePmtVals.interest))
	}

	addlPmt.principal += addlPrin;
	addlPmt.endBalance = basePmtVals.startBalance - addlPmt.principal;

	if (addlPmt.endBalance < 0) {
		addlPmt.principal = addlPmt.principal - Math.abs(addlPmt.endBalance);
		addlPmt.endBalance = 0;
	}

	return addlPmt;
}

function calcPmtVals(startBal: number, intRate: number, minPmt: number): PmtValues {
	const moInt = intRate / 100 / 12;
	const int = Math.max(0, startBal * moInt);
	const prin = Math.min(startBal, minPmt - int);

	return {
		startBalance: startBal,
		endBalance: startBal - prin,
		principal: prin,
		interest: int
	};
}

export const selectAdjPmtValues = (state: RootState): PmtValues[] => {
	const minPmt = selectMinMonthlyPmt(state);
	const params = state.plotParams;
	const adjVals = [ assessAddlPrincipal(calcPmtVals(params.balance, params.intRate, minPmt), params) ];
	
	while(adjVals[adjVals.length - 1].endBalance >= 0.01) {
		const cPmt = calcPmtVals(adjVals[adjVals.length - 1].endBalance, params.intRate, minPmt);
		cPmt.startBalance = adjVals[adjVals.length - 1].endBalance;
		adjVals.push(assessAddlPrincipal(cPmt, state.plotParams));
	}

	return adjVals;
}

export const selectBasePmtValues = (state: RootState): PmtValues[] => {
	const minPmt = selectMinMonthlyPmt(state);
	const params = state.plotParams;
	const pmtsArr: PmtValues[] = [ calcPmtVals(params.balance, params.intRate, minPmt) ];

	while  (pmtsArr[pmtsArr.length - 1].endBalance >= 0.01) {
		const lastVals = pmtsArr[pmtsArr.length - 1];
		pmtsArr.push(calcPmtVals(lastVals.endBalance, params.intRate, minPmt));
	}
	return pmtsArr;
}

export const selectInterestSavings = (state: RootState): number[] => {
	const baseVals = selectBasePmtValues(state);
	const adjVals = selectAdjPmtValues(state);

	return baseVals.map((pv, i) => (i < adjVals.length) ? pv.interest - adjVals[i].interest : pv.interest)
}

export default plotParamsSlice.reducer;