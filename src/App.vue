<template>
  <div id="app">
    <div class="d-flex flex-column flex-md-row align-items-center p-2 px-md-4 bg-dark border-bottom box-shadow">
      <h5 class="my-0 mr-md-auto font-weight-normal text-light">VERTEX</h5>
      <nav class="my-2 my-md-0 mr-md-3">
        <a class="p-2 text-light" href="#">Home</a>
        <a class="p-2 text-light" href="#">About</a>
      </nav>
      <a class="btn btn-outline-primary" href="#">Sign out</a>
    </div>

    <div id="section" class="container-fluid">
        <nav class="col-md-3 d-none d-md-block sidebar">
          <div class="sidebar-sticky">
            <ul class="nav flex-column">
              <li class="nav-item">
                <a class="nav-link active" href="#">
                  Customer Profile
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">
                  Target Demographics
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">
                  Shop Selector
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">
                  Customer Coverage
                </a>
              </li>
            </ul>
            </div>
        </nav>
      
         <component id="full_div" :is="currentView"></component>
      </div>
    </div>
  </div>
</template>

<script>
// import Vue2Leaflet from 'vue2-leaflet';
import Simple from './components/Simple';

export default {
  name: 'app',
  components: {
    Simple
  },
  data () {
    return {
      currentView: 'simple'
    }
  }
}
</script>

<style>
/* #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */

@import "../node_modules/leaflet/dist/leaflet.css";



#section {
  display: flex;
  flex-flow: row;
  /* top: 50px; */
  width: 100%;
  height: 90vh;
  margin: 0;
  padding: 0;
}

#full_div {
  /* position: absolute; */
  flex: 1;
  /* overflow: auto; */
  /* top: 55px;
  right: 0;
  left: 300px;
  bottom: 0; */
  /* padding-left: 8px; */
  /* border-left: 1px solid #ccc; */
}

</style>
