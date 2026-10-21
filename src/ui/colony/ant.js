const ANT_COLOR = '#120b07';
const SUGAR_COLOR = '#fff8ec';

/** Draws one ant facing `angle`, with legs animated by `phase`. `carrying` adds a sugar grain. */
export function drawAnt(c, x, y, angle, carrying, scale, phase) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.scale(scale, scale);

  const swing = Math.sin(phase) * 1.2;
  c.strokeStyle = ANT_COLOR;
  c.lineWidth = 0.7;
  c.beginPath();
  for (const side of [-1, 1]) {
    c.moveTo(-0.5, 0); c.lineTo(-2 + swing, side * 2.6);
    c.moveTo(0, 0); c.lineTo(-swing, side * 2.8);
    c.moveTo(0.5, 0); c.lineTo(2 + swing, side * 2.6);
  }
  c.stroke();

  c.fillStyle = ANT_COLOR;
  c.beginPath();
  c.moveTo(-0.8, 0); c.ellipse(-3, 0, 2.2, 1.6, 0, 0, 7);   // abdomen
  c.moveTo(1.3, 0); c.ellipse(0, 0, 1.3, 1, 0, 0, 7);       // thorax
  c.moveTo(3.8, 0); c.ellipse(2.4, 0, 1.4, 1.3, 0, 0, 7);   // head
  c.fill();

  if (carrying) { c.fillStyle = SUGAR_COLOR; c.fillRect(3.6, -1.4, 2.6, 2.6); }
  c.restore();
}
