import React from 'react';
import Plot from 'react-plotly.js'
import { useAppSelector, useAppDispatch } from './app/hooks';
import { 
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Input,
  InputAdornment,
  InputLabel,
  Radio,
  RadioGroup,
  TextField
} from '@material-ui/core';
import {
  AddPrinMode,
  setAddPrinAmt,
  setAddPrinPct,
  setAddPrinMode,
  setBalance,
  selectBalance,
  setIntRate,
  selectIntRate,
  selectPlotParams,
  setRemMoPmts,
  selectRemMoPmts,
  selectMinMonthlyPmt,
  selectTSValues
} from './features/plotParams/plotParamsSlice';
import './App.css';

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
      </Grid>
    </Grid>
  );
}

const PlotParamInputs: React.FC = () => {
  const bal = useAppSelector(selectBalance);
  const intRate = useAppSelector(selectIntRate);
  const remMoPmts = useAppSelector(selectRemMoPmts);

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
        <AddPrincipalInputs />
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
    </Grid>
  );
};

const CalcValues: React.FC = () => {
  const minMoPmt = useAppSelector(selectMinMonthlyPmt);

  return (
    <Grid container spacing={2}>
      <h4>Min Monthly Pmt: ${minMoPmt.toFixed(2)}</h4>
    </Grid>
  );
}

const PlotViews: React.FC = () => {
  const dataTs = useAppSelector(selectTSValues);
  const xvals = Array.from(Array(dataTs.length).keys())

  const cumPlotData: Plotly.Data[] = [
    {
      x: xvals,
      y: dataTs.map(d => d.balance),
      name: 'Balance'
    },
    {
      x: xvals,
      y: dataTs.map(d => d.totalInt),
      name: 'Cum. Interest'
    },
    {
      x: xvals,
      y: dataTs.map(d => d.totalPrincipal),
      name: 'Cum. Pricipal'
    },
  ];

  const monthlyPlotData: Plotly.Data[] = [
    {
      x: xvals,
      y: dataTs.map(d => d.principal),
      name: 'Principal'
    },
    {
      x: xvals,
      y: dataTs.map(d => d.interest),
      name: 'Interest'
    },
    {
      x: xvals,
      y: dataTs.map(d => d.principal + d.interest),
      name: 'Total Payment'
    },
  ];

  return (
    <Grid container>
      <Plot
        config={{displayModeBar: false}}
        data={cumPlotData}
        layout={{
          title: "Cumulative Interest/Pricipal",
          xaxis: {
            title: "Months"
          },
          yaxis: {
            title: "Dollars"
          }
        }}
      />
      <Plot
        config={{displayModeBar: false}}
        data={monthlyPlotData}
        layout={{
          title: "Monthly Amounts",
          xaxis: {
            title: "Months"
          },
          yaxis: {
            title: "Dollars"
          }
        }}
      />
    </Grid>
  );
}

function App() {
  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h2>Amortization Schedule Calculator</h2>
        </Grid>
        <Grid item container md={3}>
          <Grid item xs={12}>
            <PlotParamInputs />
          </Grid>
          <Grid item xs={12}>
            <CalcValues />
          </Grid>
        </Grid>
        <Grid item md={9}>
          <PlotViews />
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
