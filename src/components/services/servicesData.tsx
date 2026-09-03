// The services catalogue, standing in for the listings API.
//
// Shape follows `homeData.SERVICE_GROUPS` on purpose — the home page's category
// rails and this page render the SAME card, so the two must not drift. What is
// new here is `icon` on every card and `photo` on only some: see `CARD_PHOTOS`.

import type { ReactNode } from "react";
import type { StaticImageData } from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  Hammer, Drill, PaintRoller, DoorOpen,
  SprayCan, Sparkles, Waves, Boxes,
  Package, Bike, Clock, MapPin,
  Wrench, Droplets, ShowerHead, Gauge,
  Zap, Lightbulb, PlugZap, ShieldCheck,
  AirVent, Wind, Thermometer,
  Scissors, Hand, Palette,
  Truck, Sofa, Warehouse,
  Car,
} from "lucide-react";

import { CATEGORIES } from "@/components/homepage/homeData";

import cleaningTeam from "@public/assets/services/cleaning-team.webp";
import homeVacuum from "@public/assets/services/home-vacuum.webp";
import janitorialCart from "@public/assets/services/janitorial-cart.webp";
import autoDiagnosticsPhoto from "@public/assets/services/auto-diagnostics.webp";
import engineService from "@public/assets/services/engine-service.webp";
import gearbox from "@public/assets/services/gearbox.webp";
import suspensionPhoto from "@public/assets/services/suspension.webp";
import genericService from "@public/assets/home/oneinall.webp";

/**
 * Photos, keyed by card. Deliberately PARTIAL, exactly like
 * `TESTIMONIAL_PHOTOS`: a card with no entry falls back to its icon on a
 * brand-tinted panel, so the catalogue is complete today and every section
 * upgrades to photography one file at a time.
 *
 * Only the two categories the asset set actually covers are in here. Do not
 * paper over the rest with `genericService` — the same stock frame twenty-eight
 * times reads as broken, where a clean icon tile reads as designed.
 */
export const CARD_PHOTOS: Record<string, StaticImageData> = {
  cleaningSolutions: cleaningTeam,
  deepCleaning: genericService,
  residentialCleaning: homeVacuum,
  janitorial: janitorialCart,
  autoDiagnostics: autoDiagnosticsPhoto,
  routineMaintenance: engineService,
  transmission: gearbox,
  suspension: suspensionPhoto,
};

export type CatalogueCard = {
  key: string;
  /**
   * i18n namespace holding this card's `title` and `unit`. Defaults to
   * `servicesPage.items`. The eight cards the HOME page also renders point at
   * its namespace instead, so the same card cannot say two different things on
   * two pages — and the shared `unit` is a duration ("1 day"), which is what
   * the Clock icon beside it actually means.
   */
  copyNs?: string;
  /** Raw catalogue data — not translated, the API will own it. */
  tag: string;
  price: string;
  vendor: string;
  icon: LucideIcon;
};

export type CatalogueCategory = {
  key: string;
  /** FULL i18n path — the eight shared categories reuse the home page's
   *  names rather than duplicating them into a second namespace. */
  nameKey: string;
  icon: ReactNode;
  cards: CatalogueCard[];
  /** i18n suffixes under `servicesPage.lists.<category>`. */
  list: string[];
};

/** Namespace of the cards the home page renders too. */
const HOME_NS = "home.categoryGroups.items";

/** Icon for one of the eight shared categories, by key. */
const catIcon = (key: string) => CATEGORIES.find((c) => c.key === key)?.icon ?? null;

/**
 * The page's spine.
 *
 * The eight shared `CATEGORIES` in their canonical order, plus `mechanics` —
 * which is not a home-page tile but is a real group in `SERVICE_GROUPS`, has
 * four photographs of its own, and was a section in the old catalogue. The
 * home rail and this page therefore differ by exactly one entry, on purpose.
 */
export const CATALOGUE: CatalogueCategory[] = [
  {
    key: "handyman",
    nameKey: "home.categories.items.handyman",
    icon: catIcon("handyman"),
    cards: [
      { key: "furnitureAssembly", tag: "Home", price: "18 USD", vendor: "Vendor 1", icon: Hammer },
      { key: "wallMounting", tag: "Home", price: "22 USD", vendor: "Vendor 3", icon: Drill },
      { key: "interiorPainting", tag: "Finish", price: "40 USD", vendor: "Vendor 2", icon: PaintRoller },
      { key: "doorLockRepair", tag: "Security", price: "25 USD", vendor: "Vendor 5", icon: DoorOpen },
    ],
    list: ["shelvingBrackets", "curtainRails", "tileGrout", "windowSeals", "flatpackBuilds"],
  },
  {
    key: "cleaning",
    nameKey: "home.categories.items.cleaning",
    icon: catIcon("cleaning"),
    cards: [
      { key: "cleaningSolutions", copyNs: HOME_NS, tag: "Home", price: "10 USD", vendor: "Vendor 1", icon: SprayCan },
      { key: "deepCleaning", copyNs: HOME_NS, tag: "Home", price: "10 USD", vendor: "Vendor 1", icon: Sparkles },
      { key: "residentialCleaning", copyNs: HOME_NS, tag: "Residential", price: "15 USD", vendor: "Vendor 1", icon: Waves },
      { key: "janitorial", copyNs: HOME_NS, tag: "Commercial", price: "12 USD", vendor: "Vendor 1", icon: Boxes },
    ],
    list: ["kitchenDeepClean", "bathroomSanitising", "carpetShampoo", "windowWashing", "postRenovation"],
  },
  {
    key: "delivery",
    nameKey: "home.categories.items.delivery",
    icon: catIcon("delivery"),
    cards: [
      { key: "sameDayParcel", tag: "Express", price: "12 USD", vendor: "Vendor 4", icon: Package },
      { key: "documentCourier", tag: "Express", price: "8 USD", vendor: "Vendor 4", icon: Bike },
      { key: "scheduledPickup", tag: "Planned", price: "14 USD", vendor: "Vendor 6", icon: Clock },
      { key: "intercityDrop", tag: "Long haul", price: "30 USD", vendor: "Vendor 2", icon: MapPin },
    ],
    list: ["doorToDoor", "fragileHandling", "bulkConsignment", "liveTracking", "returnPickup"],
  },
  {
    key: "plumbing",
    nameKey: "home.categories.items.plumbing",
    icon: catIcon("plumbing"),
    cards: [
      { key: "emergencyPlumbing", tag: "Urgent", price: "32 USD", vendor: "Vendor 5", icon: Wrench },
      { key: "leakRepair", tag: "Repair", price: "20 USD", vendor: "Vendor 1", icon: Droplets },
      { key: "showerFitting", tag: "Install", price: "45 USD", vendor: "Vendor 3", icon: ShowerHead },
      { key: "drainCleaning", tag: "Maintenance", price: "26 USD", vendor: "Vendor 2", icon: Gauge },
    ],
    list: ["tapReplacement", "toiletRepairs", "pipeInsulation", "waterHeaterService", "pressureTesting"],
  },
  {
    key: "electrics",
    nameKey: "home.categories.items.electrics",
    icon: catIcon("electrics"),
    cards: [
      { key: "electricalSafetyCheck", tag: "Inspection", price: "55 USD", vendor: "Vendor 2", icon: ShieldCheck },
      { key: "lightingInstall", tag: "Install", price: "28 USD", vendor: "Vendor 1", icon: Lightbulb },
      { key: "socketRewiring", tag: "Repair", price: "35 USD", vendor: "Vendor 4", icon: PlugZap },
      { key: "fuseBoxUpgrade", tag: "Upgrade", price: "70 USD", vendor: "Vendor 3", icon: Zap },
    ],
    list: ["ceilingFans", "outdoorLighting", "smartSwitches", "faultFinding", "surgeProtection"],
  },
  {
    key: "acRepair",
    nameKey: "home.categories.items.acRepair",
    icon: catIcon("acRepair"),
    cards: [
      { key: "acServiceGasRefill", tag: "Service", price: "49 USD", vendor: "Vendor 3", icon: AirVent },
      { key: "acInstallation", tag: "Install", price: "80 USD", vendor: "Vendor 1", icon: Wind },
      { key: "acDeepClean", tag: "Service", price: "30 USD", vendor: "Vendor 2", icon: Sparkles },
      { key: "thermostatFix", tag: "Repair", price: "24 USD", vendor: "Vendor 5", icon: Thermometer },
    ],
    list: ["splitUnitService", "ductCleaning", "coolantTopUp", "compressorCheck", "annualContract"],
  },
  {
    key: "beauty",
    nameKey: "home.categories.items.beauty",
    icon: catIcon("beauty"),
    cards: [
      { key: "salonAtHome", tag: "At home", price: "28 USD", vendor: "Vendor 6", icon: Scissors },
      { key: "bridalPackage", tag: "Event", price: "120 USD", vendor: "Vendor 2", icon: Sparkles },
      { key: "maniPedi", tag: "At home", price: "18 USD", vendor: "Vendor 4", icon: Hand },
      { key: "makeupSession", tag: "Event", price: "45 USD", vendor: "Vendor 1", icon: Palette },
    ],
    list: ["haircutStyling", "facialTreatment", "threadingWaxing", "hairColouring", "groomsPackage"],
  },
  {
    key: "shifting",
    nameKey: "home.categories.items.shifting",
    icon: catIcon("shifting"),
    cards: [
      { key: "houseShifting", tag: "Move", price: "90 USD", vendor: "Vendor 3", icon: Truck },
      { key: "officeRelocation", tag: "Move", price: "150 USD", vendor: "Vendor 2", icon: Warehouse },
      { key: "packingService", tag: "Add-on", price: "35 USD", vendor: "Vendor 1", icon: Boxes },
      { key: "furnitureMoving", tag: "Single item", price: "40 USD", vendor: "Vendor 5", icon: Sofa },
    ],
    list: ["loadingUnloading", "storageShortTerm", "applianceHandling", "disassemblyRebuild", "insuranceCover"],
  },
  {
    key: "mechanics",
    nameKey: "home.categoryGroups.groups.mechanics.name",
    icon: <Car size={22} strokeWidth={1.8} aria-hidden />,
    cards: [
      { key: "autoDiagnostics", copyNs: HOME_NS, tag: "Garage", price: "10 USD", vendor: "Vendor 1", icon: Gauge },
      { key: "routineMaintenance", copyNs: HOME_NS, tag: "Garage", price: "15 USD", vendor: "Vendor 1", icon: Wrench },
      { key: "transmission", copyNs: HOME_NS, tag: "Drivetrain", price: "12 USD", vendor: "Vendor 1", icon: Car },
      { key: "suspension", copyNs: HOME_NS, tag: "Chassis", price: "20 USD", vendor: "Vendor 1", icon: Waves },
    ],
    list: ["engineTuning", "brakeService", "batteryReplacement", "wheelAlignment", "acRegas"],
  },
];

/** DOM id for a category section, shared by the rail's links and the sections
 *  themselves so the two can never disagree. */
export const sectionId = (key: string) => `cat-${key}`;
