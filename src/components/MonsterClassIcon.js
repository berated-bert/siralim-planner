import icon_nature  from '../icons/nature.png'
import icon_chaos   from '../icons/chaos.png'
import icon_sorcery from '../icons/sorcery.png'
import icon_death   from '../icons/death.png'
import icon_life    from '../icons/life.png'

/**
 * Simple function to convert to Title Case.
 * Found here: https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
 * @param  {String} str The string to convert to title case.
 * @return {String}     The string that has been convered to title case.
 */
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

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
    <span className="cls-icon">{icon && <img title={toTitleCase(pi)} src={icon} className="class-icon" alt={"class-" + pi}/>}</span>
  )
}

export default MonsterClassIcon;