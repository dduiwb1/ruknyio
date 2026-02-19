// Type declarations for react-map-gl when using monorepo with hoisted dependencies

// Support for 'react-map-gl/mapbox' subpath import
declare module 'react-map-gl/mapbox' {
  import * as React from 'react';
  
  export interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
    padding?: { top: number; bottom: number; left: number; right: number };
  }

  export interface MapProps {
    mapboxAccessToken?: string;
    mapStyle?: string | object;
    style?: React.CSSProperties;
    initialViewState?: Partial<ViewState>;
    longitude?: number;
    latitude?: number;
    zoom?: number;
    bearing?: number;
    pitch?: number;
    onMove?: (evt: { viewState: ViewState }) => void;
    onClick?: (evt: MapLayerMouseEvent) => void;
    onLoad?: (evt: any) => void;
    attributionControl?: boolean;
    children?: React.ReactNode;
    ref?: React.Ref<MapRef>;
  }

  export interface MapLayerMouseEvent {
    lngLat: { lng: number; lat: number };
    point: { x: number; y: number };
    features?: any[];
    originalEvent: MouseEvent;
  }

  export interface MapRef {
    getMap(): any;
    getCenter(): { lng: number; lat: number };
    getZoom(): number;
    flyTo(options: { center: [number, number]; zoom?: number; duration?: number }): void;
    easeTo(options: { center: [number, number]; zoom?: number; duration?: number }): void;
  }

  export interface MarkerProps {
    longitude: number;
    latitude: number;
    anchor?: 'center' | 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    offset?: [number, number];
    rotation?: number;
    rotationAlignment?: 'map' | 'viewport' | 'auto';
    pitchAlignment?: 'map' | 'viewport' | 'auto';
    draggable?: boolean;
    onClick?: (evt: any) => void;
    onDragStart?: (evt: any) => void;
    onDrag?: (evt: any) => void;
    onDragEnd?: (evt: any) => void;
    children?: React.ReactNode;
  }

  export interface NavigationControlProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    showCompass?: boolean;
    showZoom?: boolean;
    visualizePitch?: boolean;
  }

  export interface GeolocateControlProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    positionOptions?: PositionOptions;
    fitBoundsOptions?: any;
    trackUserLocation?: boolean;
    showUserLocation?: boolean;
    showAccuracyCircle?: boolean;
    showUserHeading?: boolean;
    onGeolocate?: (evt: any) => void;
    onError?: (evt: any) => void;
    onOutOfMaxBounds?: (evt: any) => void;
    onTrackUserLocationStart?: (evt: any) => void;
    onTrackUserLocationEnd?: (evt: any) => void;
  }

  const Map: React.ForwardRefExoticComponent<MapProps & React.RefAttributes<MapRef>>;
  export const Marker: React.FC<MarkerProps>;
  export const NavigationControl: React.FC<NavigationControlProps>;
  export const GeolocateControl: React.FC<GeolocateControlProps>;
  export const Popup: React.FC<any>;
  export const Source: React.FC<any>;
  export const Layer: React.FC<any>;
  export const ScaleControl: React.FC<any>;
  export const FullscreenControl: React.FC<any>;
  export const AttributionControl: React.FC<any>;

  export default Map;
}

// Backward compatibility for 'react-map-gl' root import
declare module 'react-map-gl' {
  export * from 'react-map-gl/mapbox';
  import Map from 'react-map-gl/mapbox';
  export default Map;
}
