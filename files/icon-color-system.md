# Icon Colour System

**Principle:** Colour carries *meaning*, not decoration. The same concept always uses the **same icon + same colour** on every page (Homepage and PDP). Reserve gold and red strictly so they keep their signal.

> Avoid the "all-coffee" flat look (every icon one colour) — it reads as lifeless and kills the problem/solution and rating cues. Avoid the opposite (every icon a different colour) — it looks random. The rule below keeps a 4-icon row at roughly 2 coffee + 2 green: varied, intentional, never a rainbow.

---

## The four roles

| Role | Token | Meaning — use it for | Example icons |
|---|---|---|---|
| 🟤 **Coffee** | `--ct-accent-strong` / `--ct-accent-text` | The product itself + neutral logistics: comfort, support, shipping. The default "house" colour. | `paw`, `bed`, `truck-fast`, `box-open`, `globe`, `headset` |
| 🟢 **Green** | `--ct-success` / `--ct-success-dark` | Protection, low-maintenance & trust: protects furniture, non-slip, washable, money-back, secure. "Peace of mind." | `couch`, `soap`, `shield-heart`, `shield-halved`, `lock`, `circle-check` |
| 🟡 **Gold** | `--ct-rating` | Quality & taste **only**: ratings, "stylish", premium unboxing. Used sparingly as an accent. | `star`, `box-open` (unboxing) |
| 🔴 **Red** | `--ct-error` | Problems **only**. Never decorative. | `circle-xmark` |

**Discipline note:** green should feel *earned*. If a row ever lands on 3+ greens and feels heavy, demote the softest one (e.g. "Built to last") back to coffee.

---

## Homepage

### Top trust strip
| Text | FA icon | Colour |
|---|---|---|
| Cloud-soft coral fleece | `fa-paw` | coffee |
| Raised pillow edges | `fa-bed` | coffee |
| Helps keep sofas hair-free | `fa-couch` | green |
| Machine-washable | `fa-soap` | green |

### Problem / Solution bullets
| Text | FA icon | Colour |
|---|---|---|
| Problems | `fa-circle-xmark` | red `--ct-error` |
| Solutions | `fa-circle-check` | green `--ct-success` |

### Why-choose cards
| Text | FA icon | Colour |
|---|---|---|
| Ultra-soft & cozy | `fa-paw` | coffee |
| Secure & supportive | `fa-bed` | coffee |
| Protects furniture | `fa-shield-heart` | green |
| Stylish & neutral | `fa-star` | gold |
| Easy to clean | `fa-soap` | green |
| Built to last | `fa-shield-halved` | green-dark |

### Guarantee row
| Text | FA icon | Colour |
|---|---|---|
| Guarantee | `fa-shield-heart` | green |
| Shipping | `fa-truck-fast` | coffee |
| Package | `fa-box-open` | coffee |
| Secure checkout | `fa-lock` | green-dark |

---

## Product page (PDP)

### PDP benefits
| Text | FA icon | Colour |
|---|---|---|
| Cloud-soft coral fleece | `fa-paw` | coffee |
| Raised bolster edges | `fa-bed` | coffee |
| Helps keep sofas hair-free | `fa-couch` | green |
| Non-slip base | `fa-shield-heart` | green-dark |
| Machine washable | `fa-soap` | green |

### Buy-box trust
| Text | FA icon | Colour |
|---|---|---|
| Fast shipping | `fa-truck-fast` | coffee |
| Secure payments | `fa-lock` | green-dark |
| Support that cares | `fa-headset` | coffee |

### PDP top trust bar
| Text | FA icon | Colour |
|---|---|---|
| Fast shipping | `fa-truck-fast` | coffee |
| Money-back guaranteed | `fa-shield-heart` | green |
| Secured payments | `fa-lock` | green-dark |

### PDP "why choose" cards
| Text | FA icon | Colour |
|---|---|---|
| Ultra-soft plush comfort | `fa-paw` | coffee |
| Supportive pillow design | `fa-bed` | coffee |
| Sofa protection & non-slip | `fa-couch` | green |
| Durable & easy to clean | `fa-soap` | green |

### Shipping cards
| Text | FA icon | Colour |
|---|---|---|
| Processing | `fa-box-open` | gold accent |
| Domestic | `fa-truck-fast` | coffee |
| International | `fa-globe` | coffee |

### Bottom trust bar
| Text | FA icon | Colour |
|---|---|---|
| Fast shipping | `fa-truck-fast` | coffee |
| Support that cares | `fa-headset` | coffee |
| 7-day money-back | `fa-shield-heart` | green |
| Secured checkout | `fa-lock` | green-dark |

---

## Two changes from the original draft

1. **International shipping → coffee** (not blue-green). Keep every logistics icon in the coffee family so a lone cool colour doesn't break the warm palette.
2. **Protection / non-slip standardised to `fa-shield-heart` in green** everywhere, so "protection" looks identical across Homepage, PDP benefits, and trust bars.

Everything else matches your original mapping — just made consistent under the rule.

---

## Suggested token values

```css
:root{
  --ct-accent-strong: #6E5436;  /* coffee        */
  --ct-accent-text:    #946B41;  /* coffee (support / lighter) */
  --ct-success:        #2E8B5E;  /* green         */
  --ct-success-dark:   #1C6440;  /* green-dark    */
  --ct-rating:         #C2912F;  /* gold          */
  --ct-error:          #CF4A2E;  /* red           */
}
```

*Optional calmer variant:* keep all icons coffee but tint the **tile background** by category (warm-cream vs soft-sage). Variation lives in the chip, not the glyph — premium and low-noise, while gold/red still signal where it matters.
