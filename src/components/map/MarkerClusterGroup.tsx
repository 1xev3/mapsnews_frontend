'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import React from 'react'

interface MarkerProps {
  position: [number, number]
  eventHandlers?: {
    click: () => void
  }
}

interface MarkerClusterGroupProps {
  children: ReactNode
}

const MarkerClusterGroup = ({ children }: MarkerClusterGroupProps) => {
  const map = useMap()
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)


  useEffect(() => {
    if (!map || !children) return

    clusterRef.current = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 100,
      disableClusteringAtZoom: 13
    })

    // Add markers to cluster group
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<MarkerProps>(child) && clusterRef.current) {
        const marker = L.marker(child.props.position)
        if (child.props.eventHandlers?.click) {
          marker.on('click', child.props.eventHandlers.click)
        }
        clusterRef.current.addLayer(marker)
      }
    })

    clusterRef.current.addTo(map)

    return () => {
      clusterRef.current?.clearLayers()
      clusterRef.current?.removeFrom(map)
    }
  }, [map, children])

  return null
}

export default MarkerClusterGroup 