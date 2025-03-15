import { Marker, Popup, Tooltip } from 'react-leaflet';
import { MarkerDataWithTitle } from '@/types/MarkerData';
import { NewsResponse } from '@/types/ApiTypes';

interface MapMarkersProps {
  markers: MarkerDataWithTitle[];
  selectedNews: NewsResponse | null;
  shouldShowTooltip: boolean;
  onMarkerClick: (id: string) => void;
}

const MapMarkers: React.FC<MapMarkersProps> = ({ 
  markers, 
  selectedNews, 
  shouldShowTooltip, 
  onMarkerClick 
}) => {
  return (
    <>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          eventHandlers={{
            click: () => onMarkerClick(marker.id)
          }}
          zIndexOffset={1000}
          riseOnHover={true}
          title={selectedNews?.title || ''}
        >
          <Popup>
            {selectedNews && 
              <div className="break-words">
                <h3 className="text-teal-500 font-bold text-md">{selectedNews.title}</h3>
                <p className="text-xs mt-2 text-gray-500">
                  {new Date(selectedNews.created_at).toLocaleDateString()}
                </p>
              </div>
            }
          </Popup>
          {shouldShowTooltip && (
            <Tooltip 
              permanent={true} 
              direction="bottom" 
              offset={[-16, 25]}
              className="custom-tooltip"
            >
              <span className="truncate block">{marker.title}</span>
            </Tooltip>
          )}
        </Marker>
      ))}
    </>
  );
};

export default MapMarkers;