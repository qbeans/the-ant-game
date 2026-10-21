// Adding resources always goes through here so the run and all-time totals stay in step.

export function addSugar(s, amount) {
  s.sugar += amount; s.sugarRun += amount; s.sugarAll += amount;
}

export function addMilk(s, amount) {
  s.milk += amount; s.milkAll += amount;
}

export function addDust(s, amount) {
  s.dust += amount; s.dustAll += amount;
}
