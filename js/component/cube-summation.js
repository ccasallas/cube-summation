/*
Author:       Carlos Casallas
Description: Responsible component for cube summation, it receives
             structured info produced from data-reader component.
*/
Vue.component('cube-summation', {
  props: {
      data: {
        type: Object,
        required: true
      },
      debug: {
        type: Boolean,
        required: true
      }
  },
  computed: {
    output() {  //generate cube summation for all test cases
      let tmpOutput = '';

      if(this.data.numTestCases) {
        //execute all test cases
        for(let i = 0; i < this.data.numTestCases; i++) {
          //init current test case cube
          let testCase = this.data.testCases[i];
          let cube = this.initCube(testCase.cubeSize);
          //execute current test cases operations
          for(let j = 0; j < testCase.operations.length; j++) {
            let operation = testCase.operations[j];
            if(operation.name == 'UPDATE') { //UPDATE operation
              this.updateCube(cube, operation.parameters);
            } else {  // QUERY operation
              tmpOutput = tmpOutput + this.sumCube(cube, operation.parameters) + '\n';
            }
          }
        }
      }
      return tmpOutput;
    }
  },
  methods: {
    initCube: function(size) { //init a new cube with tge given size
      let cube = [];
      for(let x = 0; x < size; x++){
        cube[x] = [];
        for(let y = 0; y < size; y++){
          cube[x][y] = []
          for(let z = 0; z < size; z++){
            cube[x][y][z] = 0;
          }
        }
      }
      return cube;
    },
    sumCube: function(cube, parameters) { //sume the given cube regarding paramters
      let res = 0;
      for(let x = parameters[0]-1; x <= parameters[3]-1; x++){
        for(let y = parameters[1]-1; y <= parameters[4]-1; y++){
          for(let z = parameters[2]-1; z <= parameters[5]-1; z++){
            res = res + cube[x][y][z];
          }
        }
      }
      return res;
    },
    updateCube: function(cube, parameters) {  // update the given cube regarding parameters
      cube[parameters[0]-1][parameters[1]-1][parameters[2]-1] = parameters[3];
    }
  },
  template: `
    <div>
      <textarea rows="13" cols="100" v-model="output" readonly></textarea>
    </div>`
});
