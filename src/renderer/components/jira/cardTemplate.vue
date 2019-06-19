<template>
  <div>
      <html>
        <head>
          <title>
            Test
          </title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        </head>
        <body>
          <div class="container-fluid mt-3">
            <div class="row">

              <div class="col-md-6 mr-0 pr-0">

                <div v-for="(issue, index) in splitCards(true)" :key="index">
                  <div class="card w-100 border-dark" style="max-height: 375px; min-height: 375px;">
                    <div class="card-body py-0 my-0" style="overflow-y: hidden;">
                      <user-template :projectData="projectData" :issue="issue"></user-template>
                    </div>
                  </div>

                  <div v-if="(index % cardsPerSheet === cardsPerSheet - 1)">
                    <br />
                    <br />
                    <br />
                  </div>
                </div>

              </div>

              <div class="col-md-6 ml-0 pl-0">

                <div v-for="(issue, index) in splitCards(false)" :key="index">
                  <div class="card w-100 border-dark" style="max-height: 375px; min-height: 375px;">
                    <div class="card-body py-0 my-0" style="overflow-y: hidden;">
                      <user-template :projectData="projectData" :issue="issue"></user-template>
                    </div>
                  </div>

                  <div v-if="(index % cardsPerSheet === cardsPerSheet - 1)">
                    <br />
                    <br />
                    <br />
                  </div>
                </div>

              </div>

            </div>
          </div>
        </body>
      </HTML>
  </div>
</template>

<script>
export default {
  props: ['issues', 'projectData'],

  data () {
    return {
      cardsPerSheet: 4
    }
  },

  methods: {

    splitCards (isLeftColumn) {
      let halfLength = Math.ceil(this.issues.length / 2)
      let formattedIssues = [...this.issues]
      if (isLeftColumn) {
        return formattedIssues.splice(0, halfLength)
      } else {
        return formattedIssues.splice(halfLength)
      }
    }
  }
}
</script>