<template>
<tr>
    <td class="align-middle">
      {{ testdata.id }}
    </td>
    <td class="align-middle">
      <input type="text" v-model="testdata.testName" class="form-control" >
    </td>
    <td class="align-middle">
      <select type="text" v-model="testdata.testType" class="form-control" >
        <option value="">Select a Type</option>
        <option value="API">API</option>
        <option value="UI">UI</option>
      </select>
    </td>
    <td class="align-middle">
      <textarea type="text" v-model="testdata.testPurpose" class="form-control" rows="2"></textarea>
    </td>
    <td class="align-middle">
      <textarea type="text" v-model="testdata.gherkin" class="form-control" rows="2"></textarea>
    </td>
    <td class="align-middle">
      <select type="text" v-model="testdata.priority" class="form-control" >
        <option value="">Select a Type</option>
        <option value="Trivial">Trivial</option>
        <option value="Minor">Minor</option>
        <option value="Major">Major</option>
        <option value="Critical">Critical</option>
      </select>
    </td>
    <td class="align-middle">
      <a @click="$emit('remove-self')" class="text-danger"><font-awesome-icon icon="trash" size="lg" /></a>
    </td>
</tr>
</template>

<script>
  export default {
    name: 'test-item',

    props: ['testdata'],

    data: function () {
      return {
      }
    },

    methods: {
    }
  }
</script>

<style>
  /* @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');
  @import '../../../node_modules/bootstrap/dist/css/bootstrap.css'; */
</style>
