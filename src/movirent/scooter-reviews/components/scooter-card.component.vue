<template>
  <div class="scooter-card" aria-label="Tarjeta de Scooter">
    <img :src="scooter.image" alt="Scooter" aria-label="Imagen del Scooter" />
    <h3 aria-label="Nombre del Scooter">{{ scooter.name }}</h3>
    <p aria-label="Distrito del Scooter">{{ scooter.district }}</p>
    <pv-button :label="$t('scooterCard.btnDetalle')" class="p-button-success" @click="viewDetail" aria-label="Ver detalle del Scooter" />
  </div>
</template>

<script>
export default {
  props: {
    scooter: Object,
  },
  methods: {
    viewDetail() {
      this.$emit('view-detail', this.scooter.id);
    },
  },
};
</script>

<style scoped>
.scooter-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  width: 220px;
  height: auto;
}

img {
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
}

h3 {
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

p {
  color: #777;
  margin-bottom: 1rem;
}
</style>
