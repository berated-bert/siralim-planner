import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import icon_nature  from '../icons/nature.png'
import icon_chaos   from '../icons/chaos.png'
import icon_sorcery from '../icons/sorcery.png'
import icon_death   from '../icons/death.png'
import icon_life    from '../icons/life.png'

// A simple function to render a monster class icon.
// It knows which icon to render via props.icon.
function MonsterClassIcon(props) {
  let pi = props.icon.toLowerCase();
  let icon;
  if(pi === "nature") icon = icon_nature;
  if(pi === "chaos")  icon = icon_chaos;
  if(pi === "sorcery") icon = icon_sorcery;
  if(pi === "death") icon = icon_death;
  if(pi === "life") icon = icon_life;

  return (
    <span className="cls-icon">{icon && <img src={icon} className="class-icon" alt={"class-" + pi}/>}</span>
  )
}

export default MonsterClassIcon;