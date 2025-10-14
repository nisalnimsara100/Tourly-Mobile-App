import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LogoForOnScreen from '../../assets/images/LogoForOnScreen.svg';
import OnBoard1 from '../../assets/images/onboard/onBoard1.svg';
import OnBoard2 from '../../assets/images/onboard/onBoard2.svg';
import OnBoard3 from '../../assets/images/onboard/onBoard3.svg';

const { width, height } = Dimensions.get('window');

const onboardingSteps = [
  {
    title: 'Craft Your\nDream Itinerary!',
    description: 'Easily build a personalized travel plan with our smart trip planner.',
    image: OnBoard1,
  },
  {
    title: 'Discover Hidden\nGems!',
    description: 'Explore unique places and experiences off the beaten path.',
    image: OnBoard2,
  },
  {
    title: 'Explore Sri Lanka,\nEffortlessly!',
    description: 'Find the best destinations, meals, and stays across Sri Lanka.',
    image: OnBoard3,
  },
];

const Onboard = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // @ts-ignore
      navigation.navigate('(tabs)');
    }
  }, [currentStep, navigation]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const startAnimation = useCallback(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000, 
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && currentStep < onboardingSteps.length - 1) {
        // Only auto-advance if NOT on the last screen
        handleNext();
      }
    });
  }, [progress, handleNext, currentStep]);

  useEffect(() => {
    startAnimation();
  }, [currentStep, startAnimation]);

  const handleTap = useCallback((event: any) => {
    const { locationX } = event.nativeEvent;
    const screenWidth = width;
    
    if (locationX < screenWidth / 2) {
      // Left side tap - go to previous
      handlePrevious();
    } else {
      // Right side tap - go to next
      handleNext();
    }
  }, [handleNext, handlePrevious]);

  const currentOnboardingData = useMemo(() => onboardingSteps[currentStep], [currentStep]);
  const CurrentImage = currentOnboardingData.image;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={StyleSheet.absoluteFillObject} 
        onPress={handleTap}
        activeOpacity={1}
      >
        <CurrentImage
          width={width}
          height={height}
          style={StyleSheet.absoluteFillObject}
        />
      </TouchableOpacity>
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{currentOnboardingData.title}</Text>
          <Text style={styles.description}>{currentOnboardingData.description}</Text>
          <View style={styles.bottomContainer}>
            <View style={styles.progressBarContainer}>
              {onboardingSteps.map((_, index) => {
                const animatedWidth = progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                });

                return (
                  <View key={index} style={styles.progressBarBackground}>
                    {index < currentStep && <View style={styles.progressBarFilled} />}
                    {index === currentStep && (
                      <Animated.View style={[styles.progressBarFilled, { width: animatedWidth }]} />
                    )}
                  </View>
                );
              })}
            </View>
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.logo}>
          <LogoForOnScreen width={80} height={80} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Add black background to prevent white flashing
  },
  imageStyle: {
    borderRadius: 39,
  },
  overlay: {
    flex: 1,
    borderRadius: 39,
    padding: 20,
  },
  gradientOverlay: {
    // Removed the black gradient overlay
    display: 'none',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 39,
    opacity: 0.8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  logo: {
    position: 'absolute',
    top: height * 0.51,
    left: 20,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 36,
    color: 'white',
    lineHeight: 50,
    marginBottom: 16,
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 17,
    color: 'white',
    lineHeight: 25,
    marginBottom: 40,
  },
  bottomContainer: {
    paddingBottom: 40,
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 1,
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 1,
  },
  nextButton: {
    top: height * 0.02,
    backgroundColor: '#85cc16',
    height: 63,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 19,
    color: 'white',
  },
});

export default Onboard;