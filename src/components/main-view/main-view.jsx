import React from 'react';
import axios from 'axios';

import { RegistrationView } from '../registration-view/registration-view';
import { LoginView } from '../login-view/login-view'; //LoginView will need to get the user details from the MainView. If LoginView is not imported here, there would be no way of passing the user details to it
import { MovieCard } from '../movie-card/movie-card';
import { MovieView } from '../movie-view/movie-view';
// import Row from 'react-bootstrap/Row';
import { Container, Row, Col, Button } from 'react-bootstrap';

import './main-view.scss';

/*essentially telling React to create a new MainView component using the generic React.Component template as its foundation */
export class MainView extends React.Component {
  /*the export keyword exposes the MainView component, and the rest of the line creates the MainView component, extends from React.Component */

  constructor() {
    /*where you initialize a state's values */
    super(); /*means call the constructor of the parent class(React.Component) ...  initializes your component’s state, and without it, you’ll get an error if you try to use this.state inside constructor()*/
    //prettier-ignore
    this.state = {
      /*represents the moment a component is created in the memory */
      movies: [],
      selectedMovie: null,
      user: null,
      newUser: null,
    };
    // this.onLoggedOut = this.onLoggedOut.bind(this);
  }

  componentDidMount() {
    //this happens every time the user loads the page
    //code executed right after component is added to the DOM
    let accessToken = localStorage.getItem('token');
    if (accessToken !== null) {
      //if the access token is present it means the user is already logged in
      this.setState({
        user: localStorage.getItem('user'), //
      });
      this.getMovies(accessToken); //only if the user is logged in you make the getMovies request
    }
  }

  /*When a movie is clicked, this function is invoked and updates the state of the `selectedMovie` *property to that movie*/
  setSelectedMovie(newSelectedMovie) {
    this.setState({
      selectedMovie: newSelectedMovie,
    });
  }
  /* When a user successfully logs in, this function updates the `user` property in state to that *particular user*/
  onLoggedIn(authData) {
    //This happens the moment the user logs in
    //This updates the state with the logged in authData
    console.log('-----------------------inside onLoggedIn MAIN-VIEW');
    console.log('authUser = ', authData);
    this.setState({
      user: authData.user.Username, //the user's username is stored in the user state
    });
    localStorage.setItem('token', authData.token); //store token and username in localStorage: a way to store data in client's browser. Next time the user opens their browser, localStorage will contain stored authentication information (token and username), and the user won’t be required to log in again
    localStorage.setItem('user', authData.user.Username);
    this.getMovies(authData.token);
  }

  onRegisterNewUser(newUser) {
    console.log('-----------------------inside OnRegistetrNewUser');
    console.log(' newUser = ', newUser);
    this.setState({
      newUser,
    });
  }

  onLoggedOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('-----------------------inside onLoggedOut');
    this.setState({
      user: null,
      newUser: null,
    });
  }

  getMovies(token) {
    console.log('inside getMovies');
    axios
      .get('https://jennysflix.herokuapp.com/movies', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        //Assign the result to the state
        this.setState({
          movies: response.data,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  render() {
    const { movies, selectedMovie, user, newUser } = this.state;
    console.log('user , new user = ', user, ', ', newUser);

    if (newUser !== null && user === null) {
      return <RegistrationView user={user} newUser={newUser} onLoggedOut={() => this.onLoggedOut()} />;
    }

    /* If there is no user, the LoginView is rendered. If there is a user logged in, the user details are *passed as a prop to the LoginView*/
    if (user === null) {
      return (
        <LoginView
          onRegisterNewUser={(newUser) => this.onRegisterNewUser(newUser)}
          onLoggedIn={(user) => this.onLoggedIn(user)}
        />
      );
    } //A method, onLoggedIn, will be passed as a prop with the same name to LoginView
    //This method will update the user state of the MainView component and will be called when the user has successfully logged in... to change the user state to valid instead of null?

    if (movies.length === 0) return <div className="main-view" />;
    return (
      <Container>
        <h1 className="title">MyFlix</h1>
        <Button variant="secondary" type="button" onClick={() => this.onLoggedOut()}>
          Log Out
        </Button>
        <div>
          <br></br>
        </div>
        {/*If the state of `selectedMovie` is not null, that selected movie will be returned otherwise, all *movies will be returned*/}
        {selectedMovie ? (
          <Row className="main-view justify-content-md-center">
            <Col md={8}>
              <MovieView
                movieData={selectedMovie}
                onBackClick={(newSelectedMovie) => {
                  this.setSelectedMovie(newSelectedMovie);
                }}
              />
            </Col>
          </Row>
        ) : (
          <Row className="main-view justify-content-md-center">
            {movies.map((movie) => (
              <Col md={3}>
                <MovieCard
                  key={movie._id}
                  movieData={movie}
                  onMovieClick={(newSelectedMovie) => {
                    this.setSelectedMovie(newSelectedMovie);
                  }}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    );
  }
}

export default MainView; /* without the default keyword, we'd have to use curly braces when importing MainView.. Can only do this once per file */
