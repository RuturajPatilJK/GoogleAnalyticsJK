import React from 'react';
import GASiteScreen from '../components/GASiteScreen';

const LOGO = require('../../assets/chinimandi.png');

export default function ChiniMandiScreen({ navigation }) {
  return (
    <GASiteScreen
      navigation={navigation}
      siteKey="chinimandi"
      title="ChiniMandi"
      subtitle="Sugar industry news portal"
      accent="#16a34a"
      url="https://www.chinimandi.com"
      logoSrc={LOGO}
      logoBg="#ffffff"
    />
  );
}
