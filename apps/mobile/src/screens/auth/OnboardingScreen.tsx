/**
 * Onboarding Screen
 * 
 * Multi-step onboarding flow to introduce new users to the app
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';

type OnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: '1',
    title: 'Manage Properties',
    description: 'Easily track and manage your real estate listings with powerful tools designed for agents.',
    icon: '🏠',
    color: '#0D47A1',
  },
  {
    id: '2',
    title: 'Connect with Clients',
    description: 'Build stronger relationships with integrated communication tools and client management.',
    icon: '👥',
    color: '#1976D2',
  },
  {
    id: '3',
    title: 'Grow Your Business',
    description: 'Access analytics, insights, and tools to help you close more deals and grow your business.',
    icon: '📈',
    color: '#2196F3',
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        scrollViewRef.current?.scrollTo({ x: (currentStep + 1) * width, animated: true });
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      handleGetStarted();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep - 1);
        scrollViewRef.current?.scrollTo({ x: (currentStep - 1) * width, animated: true });
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleGetStarted = () => {
    navigation.replace('Login');
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const renderStep = (step: OnboardingStep, index: number) => (
    <View key={step.id} style={[styles.stepContainer, { backgroundColor: step.color }]}>
      <View style={styles.contentContainer}>
        <Text style={styles.stepIcon}>{step.icon}</Text>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Steps */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.stepsContainer}
      >
        {onboardingSteps.map((step, index) => renderStep(step, index))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        {/* Page Indicators */}
        <View style={styles.indicators}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentStep ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                },
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            onPress={prevStep}
            style={[styles.navButton, { opacity: currentStep === 0 ? 0.5 : 1 }]}
            disabled={currentStep === 0}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={nextStep} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>
              {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D47A1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepsContainer: {
    flex: 1,
  },
  stepContainer: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  stepIcon: {
    fontSize: 80,
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepDescription: {
    fontSize: 16,
    color: '#BBDEFB',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  nextButtonText: {
    color: '#0D47A1',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
