// 圖示：原樣取自 legacy/v260901n.html（未改動路徑資料）
const BICO={
 full:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 min:'<path d="M6 12h12"/><path d="M9 7h6M9 17h6"/>',
 pet:'<ellipse cx="7" cy="10" rx="1.6" ry="2.1" fill="currentColor" stroke="none"/><ellipse cx="11.4" cy="8.2" rx="1.6" ry="2.2" fill="currentColor" stroke="none"/><ellipse cx="15.8" cy="9.6" rx="1.6" ry="2.1" fill="currentColor" stroke="none"/><path d="M11.6 12.6c-2.7 0-4.4 1.8-4.4 3.7 0 1.8 1.8 2.9 4.4 2.9s4.4-1.1 4.4-2.9c0-1.9-1.7-3.7-4.4-3.7z" fill="currentColor" stroke="none"/>',
 nopet:'<ellipse cx="7" cy="10" rx="1.6" ry="2.1" fill="currentColor" stroke="none"/><ellipse cx="11.4" cy="8.2" rx="1.6" ry="2.2" fill="currentColor" stroke="none"/><path d="M11.6 12.6c-2.7 0-4.4 1.8-4.4 3.7 0 1.8 1.8 2.9 4.4 2.9 1.2 0 2.2-.2 3-.7" fill="none"/><path d="M3.5 20.5L20.5 3.5"/>',
 all:'<rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/>',
 todo:'<path d="M4 7l2.5 2.5L11 5"/><path d="M4 17l2.5 2.5L11 15"/><path d="M14 7.2h6M14 17.2h6"/>',
 eyeoff:'<path d="M3 3l18 18"/><path d="M10.6 5.1A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.1 4"/><path d="M6.6 6.6A17.3 17.3 0 0 0 2 12s3.5 7 10 7a9.4 9.4 0 0 0 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
 man:'<circle cx="10" cy="14" r="5.2"/><path d="M14.2 9.8L20 4M15 4h5v5"/>',
 woman:'<circle cx="12" cy="9" r="5.2"/><path d="M12 14.2V21M9 18h6"/>'
};
function bico(n){const _p=BICO[n]||(typeof ICONS!=='undefined'&&ICONS[n]);return _p?'<svg class="bic" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+_p+'</svg>':'';}
const ICONS={
 calendar:'<rect x="3.2" y="5" width="17.6" height="15.8" rx="2"/><path d="M3.2 9.6h17.6M8 3.2v3.6M16 3.2v3.6"/>',
 umbrella:'<path d="M12 3.4c-4.8 0-8.6 3.7-8.8 8.2h17.6C20.6 7.1 16.8 3.4 12 3.4z"/><path d="M12 11.6v6.5a2.3 2.3 0 0 0 4.6 0"/>',
 washer:'<rect x="4.4" y="3.4" width="15.2" height="17.2" rx="2"/><circle cx="12" cy="14" r="4.3"/><circle cx="8" cy="6.9" r=".85" fill="currentColor" stroke="none"/>',
 camera:'<path d="M3.4 8.2h3.3l1.6-2.4h7.4l1.6 2.4h3.3v11.4H3.4z"/><circle cx="12" cy="13.7" r="3.5"/>',
 sparkle:'<path d="M10 3l1.5 4.3L15.8 8.8l-4.3 1.5L10 14.6 8.5 10.3 4.2 8.8l4.3-1.5L10 3z"/><path d="M17.6 14.4l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/>',
 bottle:'<path d="M10 3.3h4v2.5l2.1 2.6v12.3H7.9V8.4L10 5.8V3.3z"/><path d="M7.9 12.6h8.2"/>',
 clip:'<rect x="4.7" y="4.9" width="14.6" height="15.8" rx="2"/><path d="M9.1 4.9V3.7h5.8v1.2"/><path d="M8.7 10.6h6.6M8.7 14.1h6.6M8.7 17.3h4"/>',
 back:'<path d="M8.2 4.4L3.4 9.2l4.8 4.8"/><path d="M3.4 9.2h9.8a5.6 5.6 0 0 1 0 11.2H8.4"/>',
 mtn:'<path d="M2.4 19.6L9 6.9l4.2 7.7 2.3-3.6 6.1 8.6z"/><path d="M7.2 10.7L9 9.2l1.7 1.5"/>',
 wave:'<path d="M2.2 8.6c2.5-2.1 4.6-2.1 7.1 0s4.6 2.1 7.1 0 4.6-2.1 5.4 0"/><path d="M2.2 13.4c2.5-2.1 4.6-2.1 7.1 0s4.6 2.1 7.1 0 4.6-2.1 5.4 0"/><path d="M2.2 18.2c2.5-2.1 4.6-2.1 7.1 0s4.6 2.1 7.1 0 4.6-2.1 5.4 0"/>',
 goggle:'<rect x="2.6" y="8" width="18.8" height="8.4" rx="4.2"/><path d="M12 9.4v5.6"/><path d="M2.6 11.2c-1.1.3-1.1 2.2 0 2.5M21.4 11.2c1.1.3 1.1 2.2 0 2.5"/>',
 tent:'<path d="M12 4.4L3 19.8h18L12 4.4z"/><path d="M12 4.4v15.4"/><path d="M8.4 19.8L12 13.6l3.6 6.2"/>',
 city:'<path d="M3 20.4h18"/><path d="M5 20.4V9.6l5-3v13.8"/><path d="M10 20.4V12l5 2v6.4"/><path d="M15 20.4v-5l4 1.6v3.4"/><path d="M7.2 11.6v1.2M7.2 15.2v1.2M12.2 15.2v1.2"/>',
 snow:'<path d="M12 2.6v18.8M4.2 7.1l15.6 9M19.8 7.1l-15.6 9"/><path d="M9.4 4.6L12 7l2.6-2.4M9.4 19.4L12 17l2.6 2.4"/><path d="M4.9 10.6l.5-3.4 3.4.1M19.1 13.4l-.5 3.4-3.4-.1M19.1 10.6l-.5-3.4-3.4.1M4.9 13.4l.5 3.4 3.4-.1"/>',
 bolt:'<path d="M13 2L5 13h5l-1 9 8-12h-5l1-8z" fill="currentColor" stroke="none"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2v5.1l3.2 2"/>',
 bag:'<path d="M4.5 8h15l-1.2 12H5.7L4.5 8z"/><path d="M9 8V6.2a3 3 0 0 1 6 0V8"/>',
 plug:'<path d="M9 3v5M15 3v5"/><path d="M6.5 8h11v3.2a5.5 5.5 0 0 1-11 0V8z"/><path d="M12 16.7V21"/>',
 drop:'<path d="M12 3.2s6 6.4 6 10.2a6 6 0 1 1-12 0C6 9.6 12 3.2 12 3.2z"/>',
 shield:'<path d="M12 3l7.5 2.8v5.7c0 4.7-3.2 7.6-7.5 8.5-4.3-.9-7.5-3.8-7.5-8.5V5.8L12 3z"/>',
 heart:'<path d="M12 20s-7-4.3-7-8.9a3.9 3.9 0 0 1 7-2.5 3.9 3.9 0 0 1 7 2.5C19 15.7 12 20 12 20z"/>',
 shirt:'<path d="M8.4 3.2L12 5l3.6-1.8L20 6.3l-2.1 3.2-2-1V20.5H8.1V8.5l-2 1L4 6.3l4.4-3.1z"/>',
 case:'<rect x="3.2" y="7.2" width="17.6" height="12.6" rx="2"/><path d="M9 7.2V5.4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.8"/><path d="M9 11v5M15 11v5"/>',
 cart:'<circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/><path d="M2.8 4h2.4l2.6 11h10L20.5 7.6H6.2"/>',
 doc:'<path d="M6.2 3.2h7.6l4 4v13.6H6.2z"/><path d="M13.8 3.2v4h4"/><path d="M9 12h6M9 15.5h6"/>',
 alert:'<path d="M12 3.4l9 15.6H3l9-15.6z"/><path d="M12 9.6v4.2"/><circle cx="12" cy="16.6" r=".9" fill="currentColor" stroke="none"/>',
 wifi:'<path d="M3.4 9.2a14 14 0 0 1 17.2 0"/><path d="M6.8 12.6a9.3 9.3 0 0 1 10.4 0"/><path d="M10 15.9a4.6 4.6 0 0 1 4 0"/><circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none"/>',
 music:'<path d="M9.2 18.2V5.2l10-2v13"/><circle cx="6.7" cy="18.2" r="2.5"/><circle cx="16.7" cy="16.2" r="2.5"/>',
 users:'<circle cx="9" cy="8" r="3.2"/><path d="M3.2 20.2a5.8 5.8 0 0 1 11.6 0"/><path d="M16.2 5.4a3 3 0 0 1 0 5.6M18.4 20.2a5.6 5.6 0 0 0-2.1-4.1"/>',
 home:'<path d="M3.6 11.2L12 4l8.4 7.2"/><path d="M6.2 10.2v10h11.6v-10"/>',
 plane:'<path d="M21.6 3L2.6 10.6l6.9 2.5 2.5 6.9L21.6 3z"/><path d="M9.5 13.1l4.4-4.4"/>',
 car:'<path d="M4.2 15l1.6-5.6A2 2 0 0 1 7.7 8h8.6a2 2 0 0 1 1.9 1.4L19.8 15"/><rect x="3" y="15" width="18" height="4.2" rx="1.2"/><circle cx="7.2" cy="19.2" r="1.1"/><circle cx="16.8" cy="19.2" r="1.1"/>',
 paw:'<ellipse cx="6.8" cy="9.6" rx="1.8" ry="2.3" fill="currentColor" stroke="none"/><ellipse cx="11.3" cy="7.6" rx="1.8" ry="2.4" fill="currentColor" stroke="none"/><ellipse cx="16" cy="9" rx="1.8" ry="2.3" fill="currentColor" stroke="none"/><path d="M11.6 12.2c-3 0-4.9 2-4.9 4.1 0 2 2 3.2 4.9 3.2s4.9-1.2 4.9-3.2c0-2.1-1.9-4.1-4.9-4.1z" fill="currentColor" stroke="none"/>',
 fish:'<path d="M2.5 12c2.9-3.9 6.7-5.8 10.5-5.8 2.8 0 4.7 1.4 5.7 2.9l3-2v9.8l-3-2c-1 1.5-2.9 2.9-5.7 2.9-3.8 0-7.6-1.9-10.5-5.8z"/><circle cx="8.2" cy="10.9" r=".9" fill="currentColor" stroke="none"/>'
};
function icon(n){
  return n&&ICONS[n] ? '<svg class="sic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+ICONS[n]+'</svg>' : '';
}

export const EYE = '<svg class="eyeoff" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 5.1A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.1 4"/><path d="M6.6 6.6A17.3 17.3 0 0 0 2 12s3.5 7 10 7a9.4 9.4 0 0 0 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
export { BICO, ICONS, bico, icon };
export const ICON_KEYS = Object.keys(ICONS);
