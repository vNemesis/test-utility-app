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
                  <div class="card w-100" style="height: 300px; border-color: black;">
                    <div class="card-body">
                      <h2 class="card-title" :class="cardColour(issue.type.id)">{{ issue.key }}</h2>
                      <h3 class="card-subtitle mb-2 text-muted">{{ issue.title }}</h3>
                      <h5>Story Points: {{ issue.storyPoints }}</h5>
                      <span class="badge badge-secondary">{{ issue.epic }}</span>
                    </div>
                  </div>

                  <div v-if="(index % 5 === 4)">
                    <br />
                    <br />
                    <br />
                  </div>
                </div>

              </div>

              <div class="col-md-6 ml-0 pl-0">

                <div v-for="(issue, index) in splitCards(false)" :key="index">
                  <div class="card w-100" style="height: 300px; border-color: black;">
                    <div class="card-body">
                      <h2 class="card-title" :class="cardColour(issue.type.id)">{{ issue.key }}</h2>
                      <h3 class="card-subtitle mb-2 text-muted">{{ issue.title }}</h3>
                      <h5>Story Points: {{ issue.storyPoints }}</h5>
                      <span class="badge badge-secondary">{{ issue.epic }}</span>
                    </div>
                  </div>

                  <div v-if="(index % 5 === 4)">
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

  methods: {
    cardColour (id) {
      if (parseInt(id) === this.projectData.types.subTaskId || parseInt(id) === this.projectData.types.taskId) {
        return 'text-primary'
      } else if (parseInt(id) === this.projectData.types.storyId || parseInt(id) === this.projectData.types.improvementId || parseInt(id) === this.projectData.types.newFeatureId) {
        return 'text-success'
      } else if (parseInt(id) === this.projectData.types.bugId) {
        return 'text-danger'
      } else {
        return 'text-info'
      }
    },

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