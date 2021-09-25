import { 
	Checkbox,
	Divider,
	FormControl,
	FormControlLabel,
	FormLabel,
	Grid,
	Input,
	InputAdornment,
	InputLabel,
	Paper,
	Radio,
	RadioGroup,
	TextField
} from '@material-ui/core';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
	selectBalance,
	selectIntRate, 
	selectRemMoPmts,
	selectMinMonthlyPmt,
	setBalance,
	setIntRate,
	setRemMoPmts,
	AddPrinMode,
	selectPlotParams,
	setAddPrinAmt,
	setAddPrinMode,
	setAddPrinPct,
	setCmpToBase
} from '../features/plotParams/plotParamsSlice';


const AddPrincipalInputs: React.FC = () => {
  const pltPs = useAppSelector(selectPlotParams);
  const dispatch = useAppDispatch();

  let addPrinInput;
  if (pltPs.addPrinMode === AddPrinMode.STATIC) {
    addPrinInput = <FormControl fullWidth>
      <InputLabel>Extra Principal Each Month</InputLabel>
      <Input 
        type="number"
        value={pltPs.addPrinAmt}
        onChange={e => dispatch(setAddPrinAmt(parseFloat(e.target.value)))}
        startAdornment={<InputAdornment position="start">$</InputAdornment>}
      />
    </FormControl>
  } else {
    addPrinInput = <FormControl fullWidth>
      <InputLabel>
        Extra Principal as Percent of {pltPs.addPrinMode === AddPrinMode.PRIN_PERCENT ? 'Principal' : 'Total'}
      </InputLabel>
      <Input 
        type="number"
        value={pltPs.addPrinPct}
        onChange={e => dispatch(setAddPrinPct(parseFloat(e.target.value)))}
        endAdornment={<InputAdornment position="end">%</InputAdornment>}
      />
    </FormControl>
  }

  const addPrinModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setAddPrinMode((AddPrinMode as any)[e.target.value]));
  };

  return (
    <Grid item container>
      <Grid item>
        <FormControl>
          <FormLabel>Additional Principal Mode</FormLabel>
          <RadioGroup onChange={addPrinModeChange}>
            <FormControlLabel
              control={<Radio />}
              label="Percent of Principal"
              value={AddPrinMode.PRIN_PERCENT}
              checked={pltPs.addPrinMode === AddPrinMode.PRIN_PERCENT}
            />
            <FormControlLabel
              control={<Radio />}
              label="Percent of Min Pmt"
              value={AddPrinMode.PMT_PERCENT}
              checked={pltPs.addPrinMode === AddPrinMode.PMT_PERCENT}
            />
            <FormControlLabel
              control={<Radio />}
              label="Static Amount"
              value={AddPrinMode.STATIC}
              checked={pltPs.addPrinMode === AddPrinMode.STATIC}
            />
          </RadioGroup>
        </FormControl>
        {addPrinInput}
        <FormControlLabel
          control={
            <Checkbox 
              checked={pltPs.cmpToBase} 
              onChange={(e) => dispatch(setCmpToBase(e.target.checked))} 
            />}
          label="Compare Min Payment Sch."
        />
      </Grid>
    </Grid>
  );
}

const PlotParamInputs: React.FC = () => {
  const bal = useAppSelector(selectBalance);
  const intRate = useAppSelector(selectIntRate);
  const remMoPmts = useAppSelector(selectRemMoPmts);
  const minMoPmt = useAppSelector(selectMinMonthlyPmt);

  const minMoPmtTxt = minMoPmt ? minMoPmt.toFixed(2) : '--.--'

  const dispatch = useAppDispatch();

  const updateBalance = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setBalance(parseFloat(e.target.value)));
  };

  const updateIntRate = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setIntRate(parseFloat(e.target.value)));
  };

  const updateNumPmts = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setRemMoPmts(parseInt(e.target.value)));
  };

  return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<FormControl fullWidth>
					<InputLabel>Balance</InputLabel>
					<Input
						type="number"
						inputProps={{step: "1000"}}
						value={bal}
						onChange={updateBalance}
						startAdornment={<InputAdornment position="start">$</InputAdornment>}
					/>
				</FormControl>
			</Grid>
			<Grid item xs={12}>
				<FormControl fullWidth>
					<InputLabel>Annual Interest Rate</InputLabel>
					<Input
						type="number"
						value={intRate}
						onChange={updateIntRate}
						endAdornment={<InputAdornment position="end">%</InputAdornment>}
					/>
				</FormControl>
			</Grid>
			<Grid item xs={12}>
				<TextField
					type="number"
					value={remMoPmts}
					onChange={updateNumPmts}
					label="Remaining Monthly Payments"
					fullWidth
				/>
			</Grid>
			<Grid item xs={12}>
				<Divider />
			</Grid>
			<Grid item xs={12}>
				<div>Min Monthly Payment: ${minMoPmtTxt}</div>
			</Grid>
			<Grid item xs={12}>
				<Divider />
			</Grid>
			<Grid item xs={12}>
				<AddPrincipalInputs />
			</Grid>
		</Grid>

  );
};

export const Sidebar: React.FC = () => {
	return (
		<Paper elevation={2} style={{padding: "10px"}}>
			<PlotParamInputs />
		</Paper>
	);
}