<template>
  <div>
      <img id="goku" :src="gokuSource" alt="Goku Stepper">
  </div>
</template>

<script>
export default {
  data(){
      return {
          sayajin: 0,
      }
  },
  computed:{
      gokuSource:function(){
          return `/static/Goku_${this.sayajin}.png`
      }
  }
}
</script>


<style>
    #goku{
        height: 70px;
    }
</style>
