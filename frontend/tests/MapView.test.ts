import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'

const fetchMock = vi.fn()

vi.stubGlobal('useRuntimeConfig', () => ({
  public: { googleMapsKey: 'test-key', apiBase: 'http://localhost:3001' },
}))
vi.stubGlobal('$fetch', fetchMock)

vi.mock('vue3-google-map', () => ({
  GoogleMap: { template: '<div><slot /></div>' },
  Marker: { template: '<div />' },
  Polyline: { template: '<div />' },
}))

const { default: MapView } = await import('../app/components/MapView.vue')

const globalStubs = {
  ClientOnly: { template: '<div><slot /></div>' },
}

function mockGeolocation({
  succeed = true,
  lat = 13.7563,
  lng = 100.5018,
}: { succeed?: boolean; lat?: number; lng?: number } = {}) {
  Object.defineProperty(globalThis.navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: (success: PositionCallback, error?: PositionErrorCallback) => {
        if (succeed) {
          success({ coords: { latitude: lat, longitude: lng } } as GeolocationPosition)
        } else {
          error?.({ code: 1, message: 'denied' } as GeolocationPositionError)
        }
      },
    },
  })
}

describe('MapView', () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it('requests directions using the geolocation coordinates', async () => {
    mockGeolocation({ succeed: true, lat: 13.7563, lng: 100.5018 })
    fetchMock.mockResolvedValue({
      distanceText: '5.2 km',
      durationText: '15 mins',
      durationInTrafficText: '22 mins',
      polyline: '',
      steps: [],
    })

    mount(MapView, { global: { stubs: globalStubs } })
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/directions',
      expect.objectContaining({
        method: 'POST',
        body: { lat: 13.7563, lng: 100.5018 },
      })
    )
  })

  it('shows distance and duration on a successful fetch', async () => {
    mockGeolocation({ succeed: true })
    fetchMock.mockResolvedValue({
      distanceText: '5.2 km',
      durationText: '15 mins',
      durationInTrafficText: '22 mins',
      polyline: '',
      steps: [],
    })

    const wrapper = mount(MapView, { global: { stubs: globalStubs } })
    await flushPromises()

    expect(wrapper.text()).toContain('5.2 km')
    expect(wrapper.text()).toContain('22 mins')
  })

  it('shows an error state when the fetch fails', async () => {
    mockGeolocation({ succeed: true })
    fetchMock.mockRejectedValue(new Error('network error'))

    const wrapper = mount(MapView, { global: { stubs: globalStubs } })
    await flushPromises()

    expect(wrapper.find('.map-view__status--error').exists()).toBe(true)
  })

  it('shows an error state when geolocation permission is denied', async () => {
    mockGeolocation({ succeed: false })

    const wrapper = mount(MapView, { global: { stubs: globalStubs } })
    await flushPromises()

    expect(wrapper.find('.map-view__status--error').exists()).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
