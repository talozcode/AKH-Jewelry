/**
 * Curated stock photography used only where no real AKH photography exists
 * yet (hero/editorial/craftsmanship mood). All sourced from Pexels, whose
 * license permits free commercial use with no attribution required. Every
 * product photo elsewhere in the app is real, pulled from akhjewelry.com.
 *
 * Swap these for real studio photography before launch - see CLAUDE.md.
 */
function pexels(id: string, w = 1600) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}

export const STOCK = {
  heroEditorial: pexels("17892893", 1800),
  finalMoment: pexels("33513895", 1800),
  brandStoryProcess: pexels("16534488", 1400),
  craftsmanshipHands: pexels("32076602", 1200),
  craftsmanshipTools: pexels("36290395", 1200),
  bespokeEditorial: pexels("34549914", 1800),
};
