<template>
<div>
  <div class="row mt-5">
    <div class="col-md-12 text-center">

      <h1>File Creator</h1>

      <!-- Tabs -->
      <vs-tabs vs-alignment="fixed">

        <vs-tab vs-label="Bank File">
          <bank-file-creator></bank-file-creator>
        </vs-tab>
        <vs-tab vs-label="Service">
          <div class="con-tab-ejemplo">
            Service
          </div>
        </vs-tab>

      </vs-tabs>
      <!-- Tabs -->

      <!-- Row -->
    </div>
    <!-- Container -->
  </div>
  <!-- Wrapper Div -->
</div>
</template>

<script>
import BankFileCreator from './BankFileCreator'

export default {
  name: 'file-creator',
  components: { BankFileCreator },

  data: function () {
    return {
    }
  },

  computed: {
  },

  methods: {
  }
}
</script>

<style>
</style>
