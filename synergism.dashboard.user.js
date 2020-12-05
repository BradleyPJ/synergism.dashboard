// ==UserScript==
// @name         synergism dashboard
// @namespace    blaze33
// @version      0.1
// @description  Display relevant stats in a single panel
// @author       blaze33
// @match        https://pseudonian.github.io/SynergismOfficial/
// @grant        GM_addStyle
// ==/UserScript==


(function () {
  'use strict';
  const css = `
  #dashboard {
    text-align: left;
  }
  .db-table {
    display: flex;
    flex-wrap: wrap;
    margin: 0;
    padding: 0.5em;
  }
  .db-table-cell {
    box-sizing: border-box;
    flex-grow: 1;
    width: 50%;
    padding: 0.8em 1.2em;
    overflow: hidden;
    list-style: none;
    border: none;
  }
  .db-stat-line {
    display: flex;
    justify-content: space-between;
  }
  `
  console.log('hello synergism, dashboard installed in the settings tab')
  GM_addStyle(css)

  const settingsTab = document.getElementById('settings')
  const settingsChildNumber = settingsTab.childElementCount - 1
  console.log({
    settingsTab
  })

  const tab = document.createElement('div')
  tab.id = 'dashboardSubTab'
  tab.style.display = 'none'
  tab.innerHTML = `
      <div id="dashboard" class="db-table" style="background-color: #111;">
      <div class="db-table-cell" style="width: 35%;">
        <h3 style="color: plum">Overall progress stats</h3>
        <p>
        <div class="db-stat-line" style="color: orange">Constant: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: yellow">Cube tributes: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: orchid">Tesseract gifts: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: crimson">Hypercube benedictions: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: lightgoldenrodyellow">Platonic Cubes opened: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: #ffac75">C11-14 completions: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: gold">C15 exponent: <span class="dashboardstat"></span></div>
        <div class="db-stat-line">Blessing levels: <span class="dashboardstat"></span></div>
        <div class="db-stat-line">Spirit levels: <span class="dashboardstat"></span></div>
        </p>

        <h3 style="color: plum">Current run stats</h3>
        <p>
        <div class="db-stat-line" style="color: white">Loadout: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: plum">C1-5 completions: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: limegreen">C6-10 completions: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: cyan">Rune levels: <span class="dashboardstat"></span></div>
        <div class="db-stat-line">Talisman levels: <span class="dashboardstat"></span></div>
        </p>

        <h3 style="color: plum">Settings</h3>
        <p>
        <div class="db-stat-line">Autoresearch: <span class="dashboardstat"></span></div>
        <div class="db-stat-line">Autorunes: <span class="dashboardstat"></span></div>
        <div class="db-stat-line">Autochallenge: <span class="dashboardstat"></span></div>
        <div class="db-stat-line">Ants Autosacrifice: <span class="dashboardstat"></span></div>
        </p>
        </div>
        <div class="db-table-cell">
        <h3 style="color: plum">Time to plat upgrade</h3>
        Platonic upgrade: <input id="db-plat-number" type="number" min="1" max="15" step="1" value="5">
        Number of levels: <input id="db-plat-amount" type="number" min="1" max="100" step="1" value="1">
        <div id="cubeTimes"></div>
      </div>
      </div>`
  settingsTab.appendChild(tab)

  const statValues = {
    0: () => format(player.ascendShards),
    1: () => document.getElementById("cubeBlessingTotalAmount").textContent,
    2: () => document.getElementById("tesseractBlessingTotalAmount").textContent,
    3: () => document.getElementById("hypercubeBlessingTotalAmount").textContent,
    4: () => document.getElementById("platonicBlessingTotalAmount").textContent,
    5: () => player.challengecompletions.slice(11, 15).join(' / '),
    6: () => format(player.challenge15Exponent, 0),
    7: () => player.runeBlessingLevels.slice(1, 6).map(x => format(x)).join(' / '),
    8: () => player.runeSpiritLevels.slice(1, 6).map(x => format(x)).join(' / '),

    9: () => player.usedCorruptions.slice(1, 10).join(' / '),
    10: () => player.challengecompletions.slice(1, 6).join(' / '),
    11: () => player.challengecompletions.slice(6, 11).join(' / '),
    12: () => player.runelevels.join(' / '),
    13: () => {
      const talismanColors = {
        1: 'white',
        2: 'limegreen',
        3: 'lightblue',
        4: 'plum',
        5: 'orange',
        6: 'crimson'
      }
      return player.talismanLevels.slice(1, 8).map(
        (lvl, i) => `<span style="color: ${talismanColors[player.talismanRarity[i + 1]]}">${lvl}</span>`
      ).join(' / ')
    },

    14: () => {
      const roomba = player.autoResearchToggle
      const color = roomba ? 'green' : 'red'
      return `<span style="color: ${color}">${roomba ? 'ON' : 'OFF'}</span>`
    },
    15: () => {
      const autorune = player.autoSacrificeToggle
      const color = autorune ? 'green' : 'red'
      return `<span style="color: ${color}">${autorune ? 'ON' : 'OFF'}</span>`
    },
    16: () => {
      const autoch = player.autoChallengeRunning
      const color = autoch ? 'green' : 'red'
      return `<span style="color: ${color}">${autoch ? 'ON' : 'OFF'}</span>`
    },
    17: () => {
      const autosac = player.autoAntSacrifice
      const color = autosac ? 'green' : 'red'
      const realtime = player.autoAntSacrificeMode === 2
      const seconds = player.autoAntSacTimer
      return `(${seconds} ${realtime ? 'real' : 'igt'} seconds) <span style="color: ${color}">${autosac ? 'ON' : 'OFF'}</span>`
    },
  }

  const stats = Array.from(tab.querySelectorAll('.dashboardstat'))
  const cubeTimes = tab.querySelector('#cubeTimes')
  let dashboardLoopRef = 0
  const renderDashboard = () => {
    if (currentTab !== 'settings') {
      open = false
      exitDashboard()
      return
    }
    stats.forEach((stat, i) => {
      stat.innerHTML = statValues[i] ? statValues[i]() : '-'
    })
    const upgrade = Number(document.getElementById('db-plat-number').value)
    const levels = Number(document.getElementById('db-plat-amount').value)
    cubeTimes.innerHTML = `<pre>${getCubeTimes(upgrade, levels)}</pre>`
  }

  const button = document.createElement('button')
  let activeTab
  button.className = 'ascendunlockib'
  button.style = 'border: 2px solid orange; float: right;'
  const openDashboard = () => {
    // compute blessings total amounts
    const n = player.subtabNumber
    currentTab = 'cubes';
    [0, 1, 2, 3].forEach(i => {
      player.subtabNumber = i
      visualUpdateCubes()
    })
    currentTab = 'settings'
    player.subtabNumber = n
    // render and display dashboard
    renderDashboard()
    dashboardLoopRef = setInterval(renderDashboard, 1000)
    activeTab = settingsTab.getElementsByClassName('subtabActive')[0]
    activeTab.style.display = 'none'
    tab.style.display = 'block'
    button.innerText = 'Exit Dashboard'
    button.style.marginLeft = '100%'
    const buttons = Array.from(settingsTab.firstElementChild.getElementsByTagName('button')).slice(0, settingsChildNumber)
    buttons.forEach(button => {
      button.style.display = 'none'
    })
  }
  const exitDashboard = () => {
    clearInterval(dashboardLoopRef)
    tab.style.display = 'none'
    activeTab.style.display = null
    button.innerText = 'Dashboard'
    button.style.marginLeft = null
    const buttons = Array.from(settingsTab.firstElementChild.getElementsByTagName('button')).slice(0, settingsChildNumber)
    buttons.forEach(button => {
      button.style.display = null
    })
  }
  let open = false
  button.onclick = event => {
    if (open) {
      open = false
      exitDashboard()
    } else {
      open = true
      openDashboard()
    }
    return false
  }
  button.innerText = 'Dashboard'
  settingsTab.firstElementChild.appendChild(button)

  // below is Lulu's getCubeTime adapted for the dasboard script
  // ==UserScript==
  // @name         time to plat upgrade
  // @namespace    lulu
  // @version      1.3
  // @description  Calculates tess, hyper and plat time until next upgrade
  // @author       Lulu
  // @coauthor	 Dankaati for extra resources, BigWhupDude for original idea, and KittensGiveMorboGas for time stuffs
  // @match        https://pseudonian.github.io/SynergismOfficial/
  // @grant        none
  // ==/UserScript==

  // time to one level of a plat upgrade for Synergism v2.1.1 by lulu
  // Usage: paste in the console, call the function getCubeTimes(). defaults to alpha but can be used to find any upgrade and levels by doing getCubeTimes(upgrade,level)


  const SplitTime = (numberOfHours) => {
    var Days = Math.floor(numberOfHours / 24);
    var Remainder = numberOfHours % 24;
    var Hours = Math.floor(Remainder);
    var Minutes = Math.floor(60 * (Remainder - Hours));
    return ({
      "Days": Days,
      "Hours": Hours,
      "Minutes": Minutes
    })
  }

  const getCubeTimes = (i = 5, levels = 1) => {
    const x = CalcCorruptionStuff();
    const tess = x[5]
    const hyper = x[6]
    const plat = x[7]
    const Upgrades = platUpgradeBaseCosts[i]
    const tessCost = Upgrades.tesseracts * levels
    const hyperCost = Upgrades.hypercubes * levels
    const platCost = Upgrades.platonics * levels
    const time = player.ascensionCounter / 3600 / 24
    const platRate = plat / time
    const hyperRate = hyper / time
    const tessRate = tess / time
    const Day = (player.ascensionCounter) / (3600)
    const platTimeNeeded = Math.max(0, (platCost - player.wowPlatonicCubes - plat) / platRate)
    const hyperTimeNeeded = Math.max(0, (hyperCost - player.wowHypercubes - hyper) / hyperRate)
    const tessTimeNeeded = Math.max(0, (tessCost - player.wowTesseracts - tess) / tessRate)
    var Plats = SplitTime([Math.max(0, ((platCost - player.wowPlatonicCubes - x[7]) / (x[7] / Day)))]);
    var Hypers = SplitTime([Math.max(0, ((hyperCost - player.wowHypercubes - x[6]) / (x[6] / Day)))]);
    var Tess = SplitTime([Math.max(0, ((tessCost - player.wowTesseracts - x[5]) / (x[5] / Day)))]);

    const totalTimeNeeded = Math.max(platTimeNeeded, hyperTimeNeeded, tessTimeNeeded)
    var minutesToAdd = totalTimeNeeded * 1440;
    var currentDate = new Date();
    var futureDate = new Date(currentDate.getTime() + minutesToAdd * 60000);

    return "Time left until next " + [levels] + " level(s) of platonic upgrade " + [i] + " purchase:\n" +
      "Plats: " + Plats.Days + " Days, " + Plats.Hours + " Hours, " + Plats.Minutes + " Minutes \n" +
      "Hypers: " + Hypers.Days + " Days, " + Hypers.Hours + " Hours, " + Hypers.Minutes + " Minutes \n" +
      "Tess: " + Tess.Days + " Days, " + Tess.Hours + " Hours, " + Tess.Minutes + " Minutes \n" +

      "At your current rate, you are expected to get this at:\n" + futureDate + "\n" +

      "Leftovers after " + [totalTimeNeeded.toPrecision(4)] + " days:\n" +
      "Platonics: " + [(platRate * (totalTimeNeeded - platTimeNeeded)).toPrecision(4)] + " \n" +
      "Hypers: " + [(hyperRate * (totalTimeNeeded - hyperTimeNeeded)).toPrecision(4)] + " \n" +
      "Tesseracts: " + [(tessRate * (totalTimeNeeded - tessTimeNeeded)).toPrecision(4)]
  }



})();