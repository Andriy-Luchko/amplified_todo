// React imports for interactive ui
import React, { useEffect, useState } from 'react';
// import React components
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  SafeAreaView
} from 'react-native';
// import graphql api, and the queries and mutations
// client - executes the operations
// queries - get / search data
// mutations - insert or edit data
import { generateClient } from 'aws-amplify/api';
import { createTodo } from './src/graphql/mutations';
import { listTodos } from './src/graphql/queries';
// authentication
import {
  withAuthenticator,
  useAuthenticator
} from '@aws-amplify/ui-react-native';

// retrieves only the current value of 'user' from 'useAuthenticator'
// ig gets what user you are
const userSelector = (context) => [context.user];
// react native component - kinda like useState ig, user is the state and signout is setting user
const SignOutButton = () => {
  const { user, signOut } = useAuthenticator(userSelector);
  // pressable native button ig, sets onPress and style, sets text w style and the text
  return (
    <Pressable onPress={signOut} style={styles.buttonContainer}>
      <Text style={styles.buttonText}>
        Hello, {user.username}! Click here to sign out!
      </Text>
    </Pressable>
  );
};
// initial forms are empty
const initialFormState = { name: '', description: '' };
// generate the graphql client we imported earlier
const client = generateClient();

// our app
const App = () => {
    // todos are empty and form is empty
  const [formState, setFormState] = useState(initialFormState);
  const [todos, setTodos] = useState([]);
    // on app startup, fetch the todos and set todo state
  useEffect(() => {
    fetchTodos();
  }, []);
    // set new form state
  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

    // async await QUERY for the list of todos form the graphql client
  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos
      });
      // get the data, form, and items from our call
      const todos = todoData.data.listTodos.items;
      // set our todo list state
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {
    try {
        // if form state name or description is empty - do nothing
      if (!formState.name || !formState.description) return;
      // copy form state into todo object
      const todo = { ...formState };
      // add todo to our todo list
      setTodos([...todos, todo]);
      // clear the form
      setFormState(initialFormState);
      // query createToDo - why is this a query and not a mutation?
      // inserts new todo ig
      await client.graphql({
        query: createTodo,
        variables: { input: todo }
      });
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }
    // the actual app pretty straight forward react stuff
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <SignOutButton />
        <TextInput
          onChangeText={(value) => setInput('name', value)}
          style={styles.input}
          value={formState.name}
          placeholder="Name"
        />
        <TextInput
          onChangeText={(value) => setInput('description', value)}
          style={styles.input}
          value={formState.description}
          placeholder="Description"
        />
        <Pressable onPress={addTodo} style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Create todo</Text>
        </Pressable>
        {todos.map((todo, index) => (
          <View key={todo.id ? todo.id : index} style={styles.todo}>
            <Text style={styles.todoName}>{todo.name}</Text>
            <Text style={styles.todoDescription}>{todo.description}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};
// export with authenticator - people need to be logged in first to access the rest
export default withAuthenticator(App);
// the styles :cry: fs gotta learn this
const styles = StyleSheet.create({
  container: { width: 400, flex: 1, padding: 20, alignSelf: 'center' },
  todo: { marginBottom: 15 },
  input: {
    backgroundColor: '#ddd',
    marginBottom: 10,
    padding: 8,
    fontSize: 18
  },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  buttonContainer: {
    alignSelf: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 8
  },
  buttonText: { color: 'white', padding: 16, fontSize: 18 }
});