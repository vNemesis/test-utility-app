<template>
<tr>
    <td class="align-middle">
      {{ testdata.id }}
    </td>
    <td class="align-middle">
      <vs-textarea v-model="testdata.testName" rows="4" placeholder="Test Name (Summary)"/>
    </td>
    <td class="align-middle">
      <vs-select v-model="testdata.testType" class="w-100">
        <vs-select-item :key="index" :vs-value="item" :vs-text="item" v-for="(item,index) in types" />
      </vs-select>
    </td>
    <td class="align-middle">
      <vs-textarea :id="'editor' + testdata.id" v-model="testdata.testPurpose" rows="4" placeholder="Enter a description of the test"/>
    </td>
    <td class="align-middle">
      <vs-textarea v-model="testdata.gherkin" rows="4" placeholder="Gherkin code for test"/>
    </td>
    <td class="align-middle">
      <vs-select label="Priority" v-model="testdata.priority" class="w-100">
        <vs-select-item :key="index" :vs-value="item" :vs-text="item" v-for="(item,index) in priorities" />
      </vs-select>
    </td>
    <td class="align-middle">
      <a @click="$emit('remove-self')" class="text-danger"><font-awesome-icon icon="trash" size="lg" /></a>
    </td>
</tr>
</template>

<script>
  export default {
    name: 'test-item',
    components: { },

    props: ['testdata'],

    data: function () {
      return {
        types: {
          API: 'API',
          UI: 'UI'
        },
        priorities: {
          Trivial: 'Trivial',
          Minor: 'Minor',
          Major: 'Major',
          Critical: 'Critical'
        }
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
