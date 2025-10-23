import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { AttractionDetails } from '../../_components/AttractionDetails';
import LoadingScreen from '../../_components/LoadingScreen';
import { db } from '../../_constants/firebaseConfig';

export default function DetailsScreen() {
  const params = useLocalSearchParams();
  const attractionId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [attractionData, setAttractionData] = useState<any>(null);

  useEffect(() => {
    const fetchAttractionDetails = async () => {
      try {
        const attractionRef = doc(db, 'attractions', attractionId);
        const attractionDoc = await getDoc(attractionRef);
        
        if (attractionDoc.exists()) {
          const data = attractionDoc.data();
          console.log('Fetched attraction data:', data);
          // If there's a single imageUrl, convert it to the images array format
          const imageData = data.imageUrl ? [data.imageUrl] : data.images || [];
          setAttractionData({ 
            id: attractionDoc.id, 
            ...data,
            images: imageData
          });
        } else {
          console.error('No such attraction!');
        }
      } catch (error) {
        console.error('Error fetching attraction details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (attractionId) {
      fetchAttractionDetails();
    }
  }, [attractionId]);

  if (loading) {
    return <LoadingScreen message="Loading attraction details..." />;
  }

  if (!attractionData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Attraction not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AttractionDetails {...attractionData} />
    </View>
  );
}