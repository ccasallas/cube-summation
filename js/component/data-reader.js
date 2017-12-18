/*
Author:       Carlos Casallas
Description: Responsible component for read input line by line and
             generate structured info to init and operate over the cube.
*/
Vue.component('data-reader', {
  props: {
      debug: {
        type: Boolean,
        required: true
      }
  },
  data : function () {
    return {
        valid: true,
        errorMsg: '',
        userInput: "", //bind data entered for user
        dataTestCases: {}
    };
  },
  methods: {
    startReader: function() {
      try {
        this.valid = true;
        this.buildTestCases();
        this.$emit("data-ready", this.dataTestCases);
      } catch (e) {
        this.valid = false;
        this.errorMsg = e.message;
      }
    },
    buildTestCases: function() { //create test cases structure from lines array
      let tcsData = {};
      let currentPosition = 1;
      //get each line from user input
      let lines = this.readLines();
      //extract num of test cases
      tcsData.numTestCases = this.extractNumTestCases(lines[0]);
      tcsData.testCases = [];
      //extract the cases
      for(let i = 0; i < tcsData.numTestCases; i++) {
        tc = this.extractNextTestCase(currentPosition, lines)
        tcsData.testCases.push(tc);
        currentPosition = currentPosition + 1 + tc.numOperations;
      }
      //check input size
      if(currentPosition != lines.length) {
        throw new Error('Bad Input, too many lines, expected/current: ' +
          currentPosition + '/' + lines.length);
      }
      this.dataTestCases = tcsData;
    },
    readLines: function() { //convert inputext in a lines array
      let lines = this.userInput.trim().split("\n");
      if(lines.length < 3) {
        throw new Error('Bad Input... enter minimum data for at least one test case.');
      } else {
        return lines;
      }
    },
    extractNumTestCases: function(firstLine) { // extract number of test cases from lines
      let num = parseInt(firstLine.trim());
      //check format and constraints for number of test cases
      if(isNaN(num)) {
        throw new Error('Bad input, error extracting number of test cases. current: ' + firstLine);
      } else if( num < 1 || num > 50) {
        throw new Error('Constraint error: 1 <= T <= 50 ');
      } else {
        return num;
      }
    },
    extractNextTestCase: function(position, lines) { //extract data for the test case of the given position
      //check valid position
      if(position == lines.length) {
        throw new Error('Bad Input, end of input reached with pending test cases.');
      }
      // get basic data of next test case
      let tcData = lines[position].trim().split(" ");
      let testCase = {
        cubeSize: parseInt(tcData[0]),
        numOperations: parseInt(tcData[1]),
        operations: []
      };
      //check format and constraints for basic data of test case
      if(isNaN(testCase.cubeSize) || isNaN(testCase.numOperations)) {
        throw new Error('Bad input, error extracting basic test case data, current line: ' + lines[position]);
      } else if (testCase.cubeSize < 1 || testCase.cubeSize > 100) {
        throw new Error('Constraint error: 1 <= N <= 100, current: ' + testCase.cubeSize);
      } else if (testCase.numOperations < 1 || testCase.numOperations > 1000) {
        throw new Error('Constraint error: 1 <= M <= 1000, current: ' + testCase.numOperations);
      }
      //extract test case operations
      for(let i = 1; i <= testCase.numOperations; i++) {
        testCase.operations.push(
          this.extractNextOperation(position + i, lines, testCase.cubeSize));
      }
      return testCase;
    },
    extractNextOperation: function(position, lines, cubeSize) {
      //check valid position
      if(position == lines.length) {
        throw new Error('Bad Input, end of input reached with pending test cases.');
      }
      // get operation data
      let opData = lines[position].trim().split(" ");
      let operation = {
        name: opData[0],
        parameters: []
      };
      //extract operation parameters
      if(operation.name == 'UPDATE') {
        operation.parameters = this.extractUpdateParameters(opData, cubeSize);
      } else if (operation.name == 'QUERY') {
        operation.parameters = this.extractQueryParameters(opData, cubeSize);
      } else { // no valid operation
        throw new Error('Bad input, only UPDATE or QUERY operations allowed, current line: ' + lines[position]);
      }
      return operation;
    },
    extractUpdateParameters: function(opData, cubeSize) {
      let parameters = [];
      //parse each parameter
      parameters.push(parseInt(opData[1]));
      parameters.push(parseInt(opData[2]));
      parameters.push(parseInt(opData[3]));
      parameters.push(parseInt(opData[4]));
      //check format and constraints for parameters
      for(let i = 0; i < parameters.length; i++) {
        if(isNaN(parameters[i])) {
          throw new Error('Bad input, parameter must be a number, current: ' + opData[i+1]);
        }
        if (i < 3 && (parameters[i] < 1 || parameters[i] > cubeSize)) {
          throw new Error('Constraint error: 1 <= x,y,z <= N, current: ' + opData[i+1]);
        }
        if (i == 3 && (parameters[i] < -1000000000 || parameters[i] > 1000000000)) {
          throw new Error('Constraint error: -10^9 <= W <= 10^9, current: ' + opData[i+1]);
        }
      }
      return parameters;
    },
    extractQueryParameters: function(opData, cubeSize) {
      let parameters = [];
      //parse each parameter
      parameters.push(parseInt(opData[1]));
      parameters.push(parseInt(opData[2]));
      parameters.push(parseInt(opData[3]));
      parameters.push(parseInt(opData[4]));
      parameters.push(parseInt(opData[5]));
      parameters.push(parseInt(opData[6]));
      //check format and constraints for parameters
      for(let i = 0; i < parameters.length; i++) {
        if(isNaN(parameters[i])) {
          throw new Error('Bad input, parameter must be a number, current: ' + opData[i+1]);
        }
      }
      if (parameters[1] < 1 || parameters[1] > parameters[4] || parameters[4] > cubeSize) {
        throw new Error('Constraint error: 1 <= x1 <= x2 <= N, current x1, x2: ' + opData[1] +', '+ opData[4]);
      }
      if (parameters[2] < 1 || parameters[2] > parameters[5] || parameters[5] > cubeSize) {
        throw new Error('Constraint error: 1 <= y1 <= y2 <= N, current y1, y2: ' + opData[2] +', '+ opData[5]);
      }
      if (parameters[3] < 1 || parameters[3] >  parameters[6] || parameters[6] > cubeSize) {
        throw new Error('Constraint error: 1 <= z1 <= z2 <= N, current z1, z2: ' + opData[3] +', '+ opData[6]);
      }
      return parameters;
    }
  },
  computed: {
    userInputEmpty() {
      if(this.userInput) {
        return this.userInput == '';
      } else {
        return true;
      }
    }
  },
  template: `
    <div>
      <textarea rows="13" cols="100" v-model="userInput"
        placeholder="Type your lines..."></textarea>
      <br/>
      <button v-on:click="startReader()" :disabled="userInputEmpty">Iniciar</button>
      <div v-if="!valid">
        <br/>
        <span  style="color: red">{{errorMsg}}</span>
        <br/>
      </div>
      <div v-show="debug">
        <br/>
        <span>Structured data: </span>
        <pre>{{JSON.stringify(dataTestCases, null, 2)}}</pre>
        <br/>
      </div>
    </div>`
});
