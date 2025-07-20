import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnBoarding from './commonScreens/OnBoarding';
import Login from './commonScreens/Login';
import SignUp from './User/SignUp';
import SignUpOptions from './commonScreens/SignUpOptions';
import GuestSignUp from './Host/HostSignUp';
import CreateParking from './Host/CreateParking'
import Settings from './commonScreens/Settings';
import FindParking from './User/FindParking';
import SplashScreen from './commonScreens/SplashScreen';
import ForgetPassword from './commonScreens/ForgetPassword';
import Home from './User/Home';
import HostHome from './Host/HostHome';
import { Provider } from 'react-redux'; // Import Provider
import store from '../../Redux/Store'; // Import the Redux store
import YourParkings from '../app/Host/YourParkings';
import UpdateParking from '../app/Host/UpdateParking'
import HostBookingPage from './Host/Bookings';
import BookParking from './User/BookParking';
import PaymentScreen from './commonScreens/PaymentScreen';
import { StripeProvider } from '@stripe/stripe-react-native';
import Wallet from './User/Wallet';

const Stack = createStackNavigator();

const App = () => {
  return (
    <StripeProvider
      publishableKey="pk_test_51RTuOzGhS78XfKTmC2T0p6DazLuL4CkrAjobH0MT9GuJFAWTJaeRHXP4ThfHHvecAsKHY17VjyLxeO8vKEruInh700CFwxnOa7">
        <Provider store={store}>
        <Stack.Navigator initialRouteName="SplashScreen">
          <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OnBoarding"
            component={OnBoarding}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HostHome"
            component={HostHome}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FindParking"
            component={FindParking}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BookParking"
            component={BookParking}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HostSignUp"
            component={GuestSignUp}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUpOptions"
            component={SignUpOptions}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgetPassword"
            component={ForgetPassword}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateParking"
            component={CreateParking} />

          <Stack.Screen
            name="UpdateParking"
            component={UpdateParking} />

          <Stack.Screen
            name="YourParkings"
            component={YourParkings} />


          <Stack.Screen
            name="Bookings"
            component={HostBookingPage} />

          <Stack.Screen
            name="PaymentScreen"
            component={PaymentScreen} />

          <Stack.Screen
            name="Wallet"
            component={Wallet} />


        </Stack.Navigator>
      </Provider>
    </StripeProvider>
  );
}

export default App;
