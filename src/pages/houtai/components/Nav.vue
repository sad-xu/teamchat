<template lang="html">
	<div class="header">
		{{msg}}
	</div>
</template>

<script>
export default {
	data() {
		return {
			msg: 'header'
		}
	}
}
</script>

<style lang="css" scoped>
.header {
	background-color: red;
	width: 100%;
	height: 100px;
}
</style>