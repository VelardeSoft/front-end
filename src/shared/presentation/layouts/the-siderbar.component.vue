<template>
  <aside class="sidebar">
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>

</script>

<style scoped>
.sidebar{
  width: 200px;
  background-color: #513c86;
  padding: 15px;
}
.sidebar ul {
  list-style-type: none;
  padding: 0;
}

.sidebar ul li {
  margin: 10px 0;
  margin-top: 30px;
}

.sidebar ul li a {
  text-decoration: none;
  color: #fff;
  border-radius: 8px;
  background-color: aqua;
  padding: 10px;
}
.sidebar ul li a:hover {
  background-color: #f4f4f4;
  color: #333;
}
</style>