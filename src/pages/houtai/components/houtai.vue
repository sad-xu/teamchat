<template lang="html">
	<div class="houtai">
		<span>{{msg}}</span>
	</div>
</template>

<script>
import nav from './Nav.vue'

export default {
	name: 'Houtai',
	data() {
		return {
			msg: '后台首页'
		}
	}
}	
</script>

<style scoped>
.houtai {
	width: 100%;
	height: 100%;
	min-width: 800px;
	min-height: 600px;
	background-color: #bdbdbd;
}
</style>