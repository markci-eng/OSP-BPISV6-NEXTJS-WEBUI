/**
 * Height shared by every small control in the claims area's toolbars — the
 * queue's filter dropdown, its search box, its branch picker, the view toggle.
 *
 * It lived in `DeathClaimsFilter` while the death queue was the only toolbar in
 * the area. It is here now because it no longer is: the view toggle is shared,
 * and a shared control cannot take its height from one feature's filter without
 * every other feature importing that filter to stay level with it.
 *
 * `DeathClaimsFilter` re-exports this, so nothing that already imported it from
 * there has to change.
 */
export const CONTROL_HEIGHT = "36px";
