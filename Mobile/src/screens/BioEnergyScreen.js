import React from 'react';
import GASiteScreen from '../components/GASiteScreen';

const LOGO = require('../../assets/bioenergytimes.png');

export default function BioEnergyScreen({ navigation }) {
  return (
    <GASiteScreen
      navigation={navigation}
      siteKey="bioenergy"
      title="BioEnergy Times"
      subtitle="Bioenergy industry news portal"
      accent="#0b6e6e"
      url="https://www.bioenergytimes.com"
      logoSrc={LOGO}
      logoBg="#ffffff"
    />
  );
}
