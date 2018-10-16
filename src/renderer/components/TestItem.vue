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
      <!-- <font-awesome-icon icon="edit" @click="openEditor" /> -->
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
  import JiraWikiEditor from './JiraWikiEditor'
  export default {
    name: 'test-item',
    components: { JiraWikiEditor },

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
      saveText (text) {
        this.testdata.testPurpose = text
      }
    }
  }
</script>

<style>
</style>
