<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GoogleMap, Polyline, Marker } from 'vue3-google-map'
import { decodePolyline, type LatLng } from '../utils/decodePolyline'

interface DirectionsResponse {
  distanceText: string
  durationText: string
  durationInTrafficText: string
  polyline: string
  steps: Array<{ instructions: string; distanceText: string; durationText: string }>
}

const config = useRuntimeConfig()

const status = ref<'loading' | 'error' | 'success'>('loading')
const errorMessage = ref('')
const directions = ref<DirectionsResponse | null>(null)
const origin = ref<LatLng | null>(null)
const path = computed(() => (directions.value ? decodePolyline(directions.value.polyline) : []))

async function fetchDirections(lat: number, lng: number) {
  origin.value = { lat, lng }
  try {
    const data = await $fetch<DirectionsResponse>('/api/directions', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: { lat, lng },
    })
    directions.value = data
    status.value = 'success'
  } catch {
    status.value = 'error'
    errorMessage.value = 'ไม่สามารถดึงข้อมูลเส้นทางได้ กรุณาลองใหม่อีกครั้ง'
  }
}

onMounted(() => {
  if (!('geolocation' in navigator)) {
    status.value = 'error'
    errorMessage.value = 'เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchDirections(position.coords.latitude, position.coords.longitude)
    },
    () => {
      status.value = 'error'
      errorMessage.value = 'ไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง'
    }
  )
})

defineExpose({ status, errorMessage, directions, origin })
</script>

<template>
  <div class="map-view">
    <div v-if="status === 'loading'" class="map-view__status">กำลังโหลด...</div>
    <div v-else-if="status === 'error'" class="map-view__status map-view__status--error">
      {{ errorMessage }}
    </div>
    <template v-else-if="status === 'success' && directions && origin">
      <div class="map-view__summary">
        <p>ระยะทาง: {{ directions.distanceText }}</p>
        <p>เวลาเดินทางปกติ: {{ directions.durationText }}</p>
        <p>เวลาเดินทาง (ตามสภาพจราจร): {{ directions.durationInTrafficText }}</p>
      </div>
      <ClientOnly>
        <GoogleMap :api-key="config.public.googleMapsKey" style="width: 100%; height: 500px" :center="origin" :zoom="13">
          <Marker :options="{ position: origin }" />
          <Polyline :options="{ path }" />
        </GoogleMap>
      </ClientOnly>
    </template>
  </div>
</template>
