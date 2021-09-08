import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export enum AddPrinMode {
	STATIC = 'STATIC',
	PRIN_PERCENT = 'PRIN_PERCENT',
	PMT_PERCENT = 'PMT_PERCENT'
}

export interface PlotParams {
	balance: number,
	intRate: number,
	remMoPmt: number,
	addPrinMode: AddPrinMode,
	addPrinPct: number,
	addPrinAmt: number,
}

const initialState: PlotParams = {
	balance: 300000,
	intRate: 3.25,
	remMoPmt: 360,
	addPrinMode: AddPrinMode.PRIN_PERCENT,
	addPrinPct: 0,
	addPrinAmt: 0,
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
	}
});

export const {
	setBalance,
	setIntRate,
	setRemMoPmts,
	setAddPrinMode,
	setAddPrinPct,
	setAddPrinAmt
} = plotParamsSlice.actions;

export const selectPlotParams = (state: RootState) => state.plotParams;

export const selectBalance = (state: RootState) => state.plotParams.balance;

export const selectIntRate = (state: RootState) => state.plotParams.intRate;

export const selectRemMoPmts = (state: RootState) => state.plotParams.remMoPmt;

export const selectPrinMode = (state: RootState) => state.plotParams.addPrinMode;

export const selectPrinPct = (state: RootState) => state.plotParams.addPrinPct;

export const selectPrinAmt = (state: RootState) => state.plotParams.addPrinAmt;

export const selectMinMonthlyPmt = (state: RootState) => {
	const params = state.plotParams;
	const moInt = params.intRate / 100 / 12;
	return params.balance * (moInt * Math.pow(moInt + 1, params.remMoPmt)) / (Math.pow(1 + moInt, params.remMoPmt) - 1)
}

export interface AggregateValues {
	balance: number,
	interest: number,
	principal: number,
	totalInt: number,
	totalPrincipal: number
}

export const selectTSValues = (state: RootState) => {
	const minPmt = selectMinMonthlyPmt(state);
	const params = state.plotParams;
	const moInt = params.intRate / 100 / 12;
	const balanceArr: AggregateValues[] = [
		{
			balance: params.balance,
			principal: minPmt - (params.balance * moInt),
			interest: params.balance * moInt,
			totalInt: 0,
			totalPrincipal: 0
		}
	];
	let i = 0;
	while (balanceArr[balanceArr.length - 1].balance > 0) {
		const lastVals = balanceArr[balanceArr.length - 1];
		const interest = lastVals.balance * moInt
		let pPmtAmt = minPmt - interest
		if (params.addPrinMode === AddPrinMode.STATIC) {
			pPmtAmt += params.addPrinAmt
		} else if (params.addPrinMode === AddPrinMode.PRIN_PERCENT) {
			pPmtAmt += ((params.addPrinPct / 100) * pPmtAmt)
		} else if (params.addPrinMode === AddPrinMode.PMT_PERCENT) {
		  pPmtAmt += ((params.addPrinPct / 100) * minPmt)
		}
		const nextBal = lastVals.balance - pPmtAmt
		balanceArr.push({
			balance: nextBal,
			principal: pPmtAmt,
			interest: interest,
			totalInt: lastVals.totalInt + interest,
			totalPrincipal: lastVals.totalPrincipal + pPmtAmt
		});
		i++;
	}
	return balanceArr.slice(1, balanceArr.length);
}

export default plotParamsSlice.reducer;