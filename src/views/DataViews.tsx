import {
	Grid,
	Paper,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Tabs,
	Tab
} from '@material-ui/core';
import React, { useState } from 'react'
import Plot from 'react-plotly.js';
import { useAppSelector } from '../app/hooks';
import {
	selectAdjPmtValues,
	selectBasePmtValues,
	selectBalance,
	selectCmpToBase,
	PmtValues,
	selectInterestSavings
}
from '../features/plotParams/plotParamsSlice';

function generateBasePmtCumTraces(data: PmtValues[]): Plotly.Data[] {
	const xvals = Array.from(Array(data.length).keys())
	
	return [
		{
      x: xvals,
      y: data.map(d => d.startBalance),
      name: 'Base Balance',
			line: {
				color: '#1f77b4',
				dash: 'dash'
			},
    },
    {
      x: xvals,
			y: data.reduce(
				(arr: number[], pv: PmtValues): number[] => {
					arr.push(arr[arr.length-1] + pv.interest);
					return arr;
				},
				[0] 
			),
      name: 'Base Cum. Interest',
			line: {
				color: '#ff7f0e',
				dash: 'dash'
			},
    },
    {
      x: xvals,
      y: data.reduce(
				(arr: number[], pv: PmtValues): number[] => {
					arr.push(arr[arr.length-1] + pv.principal);
					return arr;
				},
				[0] 
			),
      name: 'Base Cum. Principal',
			line: {
				color: '#2ca02c',
				dash: 'dash'
			},
    },
	];
}

function generateBasePmtMoTraces(data: PmtValues[]): Plotly.Data[] {
	const xvals = Array.from(Array(data.length).keys())
	
	return [
		{
      x: xvals,
      y: data.map(d => d.principal + d.interest),
      name: 'Base Total Payment',
			line: {
				color: '#1f77b4',
				dash: 'dash'
			},
    },
    {
      x: xvals,
      y: data.map(d => d.interest),
      name: 'Base Interest',
			line: {
				color: '#ff7f0e',
				dash: 'dash'
			},
    },
    {
      x: xvals,
      y: data.map(d => d.principal),
      name: 'Base Principal',
			line: {
				color: '#2ca02c',
				dash: 'dash'
			},
    },
	];
}

const PlotViews: React.FC = () => {
	const cmpToBase = useAppSelector(selectCmpToBase);
	const baseData = useAppSelector(selectBasePmtValues);
  const dataTs = useAppSelector(selectAdjPmtValues);
	const intSave = useAppSelector(selectInterestSavings);
  const xvals = Array.from(Array(dataTs.length).keys())

  let cumPlotData: Plotly.Data[] = [
    {
      x: xvals,
      y: dataTs.map(d => d.startBalance),
      name: 'Balance'
    },
    {
      x: xvals,
			y: dataTs.reduce(
				(arr: number[], pv: PmtValues): number[] => {
					arr.push(arr[arr.length-1] + pv.interest);
					return arr;
				},
				[0] 
			),
      name: 'Cum. Interest'
    },
    {
      x: xvals,
      y: dataTs.reduce(
				(arr: number[], pv: PmtValues): number[] => {
					arr.push(arr[arr.length-1] + pv.principal);
					return arr;
				},
				[0] 
			),
      name: 'Cum. Principal'
    },
  ];

  let monthlyPlotData: Plotly.Data[] = [
    {
      x: xvals,
      y: dataTs.map(d => d.principal + d.interest),
      name: 'Total Payment'
    },
    {
      x: xvals,
      y: dataTs.map(d => d.interest),
      name: 'Interest'
    },
    {
      x: xvals,
      y: dataTs.map(d => d.principal),
      name: 'Principal'
    },
  ];

	if (cmpToBase) {
		cumPlotData = cumPlotData.concat(generateBasePmtCumTraces(baseData))
		cumPlotData.push(
			{
				x: Array.from(Array(intSave.length).keys()),
				y: intSave.reduce(
						(acc: number[], x: number): number[] => {
							acc.push(acc[acc.length - 1] + x)
							return acc
						},
						[0]
					),
				name: 'Cum. Interest Savings'
			}
		)
		monthlyPlotData = monthlyPlotData.concat(generateBasePmtMoTraces(baseData))
		monthlyPlotData.push(
			{
				x: Array.from(Array(intSave.length).keys()),
				y: intSave,
				name: 'Interest Savings'
			}
		)
	}

  return (
    <Grid container spacing={2}>
      <Grid item>
        <Paper>
          <Plot
            config={{displayModeBar: false}}
            data={cumPlotData}
            layout={{
							width: 800,
              title: "Cumulative Interest/Principal",
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
							width: 800,
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
  const monthlyData = useAppSelector(selectBasePmtValues);

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
            return (
              <TableRow>
                <TableCell>{i}</TableCell>
                <TableCell>{currency(d.startBalance)}</TableCell>
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

export const DataViews: React.FC = () => {
	const [tabIdx, setTabIdx] = useState(0);

	return (
		<>
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
		</>
	);
}