'use client';
import { createContext, useContext } from 'react';
type Section = {title:string;description:string;asset?:{url:string}|null;content:unknown};
const SectionContext=createContext<Section|null>(null);
export const useLandingSection=()=>useContext(SectionContext);
export function LandingSection({section,children}:{section:Section;children:React.ReactNode}) {
  return <SectionContext.Provider value={section}><div style={section.asset?{backgroundImage:`url("${section.asset.url}")`,backgroundSize:'cover'}:undefined}>{children}</div></SectionContext.Provider>;
}
