import React, { useState } from 'react';
import Plot from 'react-plotly.js'
import { useAppSelector, useAppDispatch } from './app/hooks';
import { 
  AppBar,
  Container,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
  Divider
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
    <Paper elevation={2} style={{padding: "10px"}}>
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
    </Paper>
  );
};

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
      y: dataTs.map(d => d.principal + d.interest),
      name: 'Total Payment'
    },
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
  ];

  return (
    <Grid container spacing={2}>
      <Grid item>
        <Paper>
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
        </Paper>
      </Grid>
      <Grid item>
        <Paper>
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
        </Paper>
      </Grid>
    </Grid>
  );
}

const PaymentTable: React.FC = () => {
  const initBal = useAppSelector(selectBalance);
  const monthlyData = useAppSelector(selectTSValues);

  const currency = (n: number): string => '$' + n.toFixed(2)

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Month</TableCell>
            <TableCell>Starting Balance</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell>Principal</TableCell>
            <TableCell>Interest</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {monthlyData.map((d, i) => {
            const startBal = i > 0 ? monthlyData[i - 1].balance : initBal;
            return (
              <TableRow>
                <TableCell>{i}</TableCell>
                <TableCell>{currency(startBal)}</TableCell>
                <TableCell>{currency(d.principal + d.interest)}</TableCell>
                <TableCell>{currency(d.principal)}</TableCell>
                <TableCell>{currency(d.interest)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const TabView: React.FC<{children: React.ReactNode, index: number, value:number}> = 
  ({children, value, index}) => {
    return (
      <div>
        {value === index && children}
      </div>
    );
  }

function App() {
  const [tabIdx, setTabIdx] = useState(0);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4">
              Amortization Schedule Calculator
            </Typography>
          </Toolbar>
        </AppBar>
      <Toolbar />
      <Container>
        <Grid container spacing={2}>
          <Grid item md={3}>
            <PlotParamInputs />
          </Grid>
          <Grid item md={9}>
            <Tabs value={tabIdx} onChange={(_, nv) => setTabIdx(nv)}>
              <Tab label="Plots" />
              <Tab label="Table" />
            </Tabs>
            <TabView value={tabIdx} index={0}>
              <PlotViews />
            </TabView>
            <TabView value={tabIdx} index={1}>
              <PaymentTable />
            </TabView> 
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default App;
