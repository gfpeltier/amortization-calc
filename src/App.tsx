import { 
  AppBar,
  Container,
  Grid,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { GitHub } from '@material-ui/icons';
import { Sidebar } from './views/Sidebar';
import { DataViews } from './views/DataViews';


function App() {

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4" style={{flexGrow: 1}}>
              Amortization Schedule Calculator
          </Typography>
          <a style={{color: "white"}} href="https://github.com/gfpeltier/amortization-calc">
            <GitHub fontSize="large" />
          </a>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Container>
        <Grid container spacing={2}>
          <Grid item md={3}>
            <Sidebar />
          </Grid>
          <Grid item md={9}>
            <DataViews />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default App;
