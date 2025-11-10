import preset, { type EditorAPI } from '@coze-editor/editor/preset-universal'
import { EditorProvider } from '@coze-editor/editor/react'
import { MergeViewRenderer } from '@coze-editor/editor/react-merge'
import { goToNextChunk, goToPreviousChunk } from '@codemirror/merge'
import { EditorView } from '@codemirror/view'
import { useRef } from 'react'
import { Extension } from '@codemirror/state';
import { Button } from '@/components/ui/button';

import './index.css';

const extensions: Extension[] = [
  EditorView.lineWrapping,
];

// const oldValue = `A janitor cleans offices. He sweeps floors. He empties trash. He wipes windows. He keeps everything tidy.
// A receptionist answers phones. She greets visitors. She schedules appointments. She helps everyone feel welcome.
// A courier delivers letters. He rides a scooter. He brings messages. He is always on time.
// A street cleaner sweeps the road. He picks up litter. He keeps the city clean. He works before sunrise.
// A busker plays music. He sings songs. He entertains crowds. People stop to listen.
// A tailor repairs clothes. She sews buttons. She fixes zippers. She makes old clothes new.
// A cobbler fixes shoes. He polishes leather. He replaces soles. He helps people walk comfortably.
// A watchmaker repairs watches. He works with tiny gears. He fixes broken hands. He makes time tick again.
// A jeweler polishes rings. She sets stones. She creates beautiful jewelry. Customers admire her work.
// A chef creates new recipes. He tries new flavors. He cooks with passion. People enjoy his dishes.
// A waiter serves food. He takes orders. He brings drinks. He clears tables. He smiles at guests.
// A bartender mixes drinks. He shakes cocktails. He pours wine. He listens to stories. He keeps the bar lively.
// A hotel manager greets guests. She checks rooms. She solves problems. She ensures comfort for all.
// A bellhop carries luggage. He opens doors. He helps guests. He knows every room.
// A doorman welcomes visitors. He opens the door. He tips his hat. He remembers faces.
// A concierge gives advice. She recommends restaurants. She books tickets. She helps guests enjoy the city.
// A tour guide leads groups. He shares stories. He points out landmarks. He answers questions.
// A taxi dispatcher coordinates rides. She answers calls. She sends drivers. She keeps things moving.
// A traffic officer directs cars. He blows his whistle. He waves his hands. He keeps the roads safe.
// A crossing guard helps children. She stops traffic. She smiles at students. She keeps everyone safe.
// A paramedic responds to emergencies. He drives fast. He gives first aid. He saves lives.
// A doctor examines patients. She listens carefully. She prescribes medicine. She offers reassurance.
// A dentist checks teeth. He cleans and fixes. He helps people smile.
// A pharmacist fills prescriptions. She explains medicine. She helps people feel better.
// A veterinarian cares for animals. She treats pets. She gives vaccines. She comforts worried owners.
// A pet groomer washes dogs. He trims fur. He clips nails. He makes pets look neat.
// A pet walker strolls with dogs. She picks up after them. She keeps them happy and healthy.
// A child plays in the park. She laughs loudly. She runs fast. She swings high.
// A teenager studies in the library. He reads books. He writes notes. He prepares for exams.
// A college student attends lectures. She takes notes. She asks questions. She learns new things.
// A professor teaches classes. He explains concepts. He inspires students. He shares knowledge.
// A researcher studies data. She runs experiments. She writes reports. She discovers new facts.
// A scientist invents new things. He tests ideas. He builds models. He changes the world.
// An engineer designs bridges. She draws plans. She checks details. She solves problems.
// An architect creates buildings. He sketches designs. He visits sites. He supervises construction.
// A construction worker builds walls. He pours concrete. He lifts beams. He shapes the city.
// A plumber fixes pipes. She stops leaks. She installs faucets. She keeps water flowing.
// An electrician wires homes. He installs lights. He repairs circuits. He keeps power on.
// A carpenter builds furniture. She cuts wood. She hammers nails. She sands surfaces.
// A painter colors walls. He brushes carefully. He chooses shades. He makes rooms beautiful.
// A roofer repairs roofs. She climbs high. She replaces shingles. She keeps homes dry.
// A landscaper plants trees. He mows lawns. He trims bushes. He creates green spaces.
// A delivery driver brings packages. She follows routes. She rings doorbells. She delivers smiles.
// A postal worker sorts mail. He carries letters. He walks many miles. He connects people.
// A garbage collector picks up trash. She lifts bins. She empties cans. She keeps streets clean.
// A recycling worker sorts materials. He separates paper. He collects bottles. He helps the environment.
// A factory worker assembles products. She checks quality. She packs boxes. She works on a team.
// A warehouse worker moves goods. He loads trucks. He organizes shelves. He keeps inventory.
// A truck driver travels far. She delivers cargo. She drives safely. She meets deadlines.
// A pilot flies planes. He checks instruments. He communicates with towers. He lands smoothly.
// A flight attendant serves passengers. She gives safety instructions. She offers drinks. She ensures comfort.
// An air traffic controller guides planes. He watches screens. He gives directions. He keeps skies safe.
// A ship captain steers vessels. She navigates waters. She leads the crew. She delivers goods.
// A sailor works on deck. He ties ropes. He checks equipment. He keeps the ship running.
// A fisherman catches fish. She casts nets. She hauls in the catch. She sells at the market.
// A farmer grows crops. He plants seeds. He waters fields. He harvests food.
// A rancher raises animals. She feeds cattle. She cares for horses. She manages the land.
// A beekeeper tends hives. He collects honey. He protects bees. He helps pollination.
// A chef buys fresh ingredients. She visits markets. She chooses the best. She prepares delicious meals.
// A food critic tastes dishes. He writes reviews. He shares opinions. He influences restaurants.
// A food vendor sells snacks. She fries dumplings. She grills skewers. She serves hungry customers.
// A grocer stocks shelves. He checks dates. He helps shoppers. He keeps food fresh.
// A cashier scans items. She counts change. She bags groceries. She greets customers.
// A store manager oversees staff. He checks inventory. He solves problems. He keeps the store running.
// A model wears outfits. He walks runways. He poses for photos. He showcases designs.
// A makeup artist applies cosmetics. She highlights features. She creates looks. She helps people shine.
// A hairdresser cuts hair. He styles curls. He colors roots. He makes clients happy.
// A nail technician paints nails. She shapes tips. She adds designs. She creates art.
// A spa therapist gives massages. He relaxes muscles. He soothes stress. He promotes wellness.
// A fitness trainer leads classes. She demonstrates exercises. She motivates clients. She builds strength.
// A yoga instructor teaches poses. He guides breathing. He encourages relaxation. He fosters balance.
// A sports coach trains athletes. She plans drills. She builds teamwork. She celebrates victories.
// A referee enforces rules. He blows the whistle. He makes calls. He keeps games fair.
// A stadium worker sells tickets. She checks seats. She helps fans. She supports events.
// A broadcaster reports news. He reads headlines. He interviews guests. He informs the public.
// A journalist writes articles. She investigates stories. She checks facts. She shares news.
// A photographer captures moments. He edits images. He publishes photos. He tells stories visually.
// A filmmaker directs movies. She writes scripts. She chooses actors. She creates scenes.
// An actor performs roles. He memorizes lines. He expresses emotions. He entertains audiences.
// A musician plays instruments. She writes songs. She records music. She performs live.
// A singer belts melodies. He practices scales. He records albums. He tours cities.
// A composer writes scores. She arranges notes. She conducts orchestras. She creates music.
// A dancer rehearses steps. He learns choreography. He performs on stage. He moves gracefully.
// An artist paints canvases. She sketches ideas. She displays art. She inspires others.
// A sculptor shapes clay. He carves stone. He creates statues. He leaves a legacy.
// A poet writes verses. She finds rhythm. She explores feelings. She shares with readers.
// An author writes novels. He creates characters. He builds worlds. He publishes books.
// A librarian organizes shelves. She recommends books. She hosts events. She encourages reading.
// A teacher explains lessons. He answers questions. He inspires curiosity. He shapes minds.
// A principal leads a school. She supports teachers. She helps students. She manages staff.
// A counselor listens to problems. He offers advice. He supports growth. He guides choices.
// A social worker helps families. She finds resources. She offers support. She changes lives.
// A psychologist studies behavior. He helps with emotions. He offers therapy. He promotes well-being.
// A doctor diagnoses illness. She prescribes treatment. She monitors progress. She saves lives.
// A nurse gives care. He checks vitals. He comforts patients. He supports recovery.
// A pharmacist dispenses medicine. She explains usage. She answers questions. She ensures safety.
// A dentist cleans teeth. He checks gums. He fixes cavities. He promotes health.
// A veterinarian treats animals. She performs surgery. She gives advice. She loves pets.`

const oldValue = '';

const newValue = `A janitor cleans offices. He sweeps floors. He empties trash. He wipes windows. He keeps everything tidy.
A receptionist answers phones. She greets visitors. She schedules appointments. She helps everyone feel welcome.
A courier delivers letters. He rides a scooter. He brings messages. He is always on time.
A street cleaner sweeps the road. He picks up litter. He keeps the city clean. He works before sunrise.
A busker plays music. He sings songs. He entertains crowds. People stop to listen.
A tailor repairs clothes. She sews buttons. She fixes zippers. She makes old clothes new.
A cobbler fixes shoes. He polishes leather. He replaces soles. He helps people walk comfortably.
A watchmaker repairs watches. He works with tiny gears. He fixes broken hands. He makes time tick again.
A jeweler polishes rings. She sets stones. She creates beautiful jewelry. Customers admire her work.
A chef creates new recipes. He tries new flavors. He cooks with passion. People enjoy his dishes.
A waiter serves food. He takes orders. He brings drinks. He clears tables. He smiles at guests.
A bartender mixes drinks. He shakes cocktails. He pours wine. He listens to stories. He keeps the bar lively.
A hotel manager greets guests. She checks rooms. She solves problems. She ensures comfort for all.
A bellhop carries luggage. He opens doors. He helps guests. He knows every room.
A doorman welcomes visitors. He opens the door. He tips his hat. He remembers faces.
A concierge gives advice. She recommends restaurants. She books tickets. She helps guests enjoy the city.
A tour guide leads groups. He shares stories. He points out landmarks. He answers questions.
A taxi dispatcher coordinates rides. She answers calls. She sends drivers. She keeps things moving.
A traffic officer directs cars. He blows his whistle. He waves his hands. He keeps the roads safe.
A crossing guard helps children. She stops traffic. She smiles at students. She keeps everyone safe.
A paramedic responds to emergencies. He drives fast. He gives first aid. He saves lives.
A doctor examines patients. She listens carefully. She prescribes medicine. She offers reassurance.
A dentist checks teeth. He cleans and fixes. He helps people smile.
A pharmacist fills prescriptions. She explains medicine. She helps people feel better.
A veterinarian cares for animals. She treats pets. She gives vaccines. She comforts worried owners.
A pet groomer washes dogs. He trims fur. He clips nails. He makes pets look neat.
A pet walker strolls with dogs. She picks up after them. She keeps them happy and healthy.
A child plays in the park. She laughs loudly. She runs fast. She swings high.
A teenager studies in the library. He reads books. He writes notes. He prepares for exams.
A college student attends lectures. She takes notes. She asks questions. She learns new things.
A professor teaches classes. He explains concepts. He inspires students. He shares knowledge.
A researcher studies data. She runs experiments. She writes reports. She discovers new facts.
A scientist invents new things. He tests ideas. He builds models. He changes the world.
An engineer designs bridges. She draws plans. She checks details. She solves problems.
An architect creates buildings. He sketches designs. He visits sites. He supervises construction.
A construction worker builds walls. He pours concrete. He lifts beams. He shapes the city.
A plumber fixes pipes. She stops leaks. She installs faucets. She keeps water flowing.
An electrician wires homes. He installs lights. He repairs circuits. He keeps power on.
A carpenter builds furniture. She cuts wood. She hammers nails. She sands surfaces.
A painter colors walls. He brushes carefully. He chooses shades. He makes rooms beautiful.
A roofer repairs roofs. She climbs high. She replaces shingles. She keeps homes dry.
Diff 1: A landscaper plants trees. He mows lawns. He trims bushes. He creates green spaces.
A delivery driver brings packages. She follows routes. She rings doorbells. She delivers smiles.
A postal worker sorts mail. He carries letters. He walks many miles. He connects people.
A garbage collector picks up trash. She lifts bins. She empties cans. She keeps streets clean.
A recycling worker sorts materials. He separates paper. He collects bottles. He helps the environment.
A factory worker assembles products. She checks quality. She packs boxes. She works on a team.
A warehouse worker moves goods. He loads trucks. He organizes shelves. He keeps inventory.
A truck driver travels far. She delivers cargo. She drives safely. She meets deadlines.
A pilot flies planes. He checks instruments. He communicates with towers. He lands smoothly.
A flight attendant serves passengers. She gives safety instructions. She offers drinks. She ensures comfort.
An air traffic controller guides planes. He watches screens. He gives directions. He keeps skies safe.
A ship captain steers vessels. She navigates waters. She leads the crew. She delivers goods.
A sailor works on deck. He ties ropes. He checks equipment. He keeps the ship running.
A fisherman catches fish. She casts nets. She hauls in the catch. She sells at the market.
A farmer grows crops. He plants seeds. He waters fields. He harvests food.
A rancher raises animals. She feeds cattle. She cares for horses. She manages the land.
A beekeeper tends hives. He collects honey. He protects bees. He helps pollination.
A chef buys fresh ingredients. She visits markets. She chooses the best. She prepares delicious meals.
A food critic tastes dishes. He writes reviews. He shares opinions. He influences restaurants.
Diff 2: A food vendor sells snacks. She fries dumplings. She grills skewers. She serves hungry customers.
A grocer stocks shelves. He checks dates. He helps shoppers. He keeps food fresh.
A cashier scans items. She counts change. She bags groceries. She greets customers.
A store manager oversees staff. He checks inventory. He solves problems. He keeps the store running.
A model wears outfits. He walks runways. He poses for photos. He showcases designs.
A makeup artist applies cosmetics. She highlights features. She creates looks. She helps people shine.
A hairdresser cuts hair. He styles curls. He colors roots. He makes clients happy.
A nail technician paints nails. She shapes tips. She adds designs. She creates art.
A spa therapist gives massages. He relaxes muscles. He soothes stress. He promotes wellness.
A fitness trainer leads classes. She demonstrates exercises. She motivates clients. She builds strength.
A yoga instructor teaches poses. He guides breathing. He encourages relaxation. He fosters balance.
A sports coach trains athletes. She plans drills. She builds teamwork. She celebrates victories.
A referee enforces rules. He blows the whistle. He makes calls. He keeps games fair.
A stadium worker sells tickets. She checks seats. She helps fans. She supports events.
A broadcaster reports news. He reads headlines. He interviews guests. He informs the public.
A journalist writes articles. She investigates stories. She checks facts. She shares news.
A photographer captures moments. He edits images. He publishes photos. He tells stories visually.
A filmmaker directs movies. She writes scripts. She chooses actors. She creates scenes.
An actor performs roles. He memorizes lines. He expresses emotions. He entertains audiences.
A musician plays instruments. She writes songs. She records music. She performs live.
A singer belts melodies. He practices scales. He records albums. He tours cities.
A composer writes scores. She arranges notes. She conducts orchestras. She creates music.
A dancer rehearses steps. He learns choreography. He performs on stage. He moves gracefully.
An artist paints canvases. She sketches ideas. She displays art. She inspires others.
A sculptor shapes clay. He carves stone. He creates statues. He leaves a legacy.
A poet writes verses. She finds rhythm. She explores feelings. She shares with readers.
An author writes novels. He creates characters. He builds worlds. He publishes books.
A librarian organizes shelves. She recommends books. She hosts events. She encourages reading.
A teacher explains lessons. He answers questions. He inspires curiosity. He shapes minds.
Diff 3: A principal leads a school. She supports teachers. She helps students. She manages staff.
A counselor listens to problems. He offers advice. He supports growth. He guides choices.
A social worker helps families. She finds resources. She offers support. She changes lives.
A psychologist studies behavior. He helps with emotions. He offers therapy. He promotes well-being.
A doctor diagnoses illness. She prescribes treatment. She monitors progress. She saves lives.
A nurse gives care. He checks vitals. He comforts patients. He supports recovery.
A pharmacist dispenses medicine. She explains usage. She answers questions. She ensures safety.
A dentist cleans teeth. He checks gums. He fixes cavities. He promotes health.
A veterinarian treats animals. She performs surgery. She gives advice. She loves pets.`

function Page() {
  const editorRef = useRef<EditorAPI | null>(null)

  function prev() {
    const view = editorRef.current?.$view
    if (!view) {
      return
    }
    goToPreviousChunk(view)
  }

  function next() {
    const view = editorRef.current?.$view
    if (!view) {
      return
    }
    goToNextChunk(view)
  }
  return <>
    <Button size="sm" className="mr-2" onClick={prev}>Previous</Button>
    <Button size="sm" onClick={next}>Next</Button>
    <div>
      <EditorProvider>
        <div className="relative">
          <div className="absolute left-0 top-0 w-[50%] h-full z-1 bg-[#ddd] text-white flex items-center justify-center">
            empty
          </div>
          <MergeViewRenderer
            plugins={preset}
            mergeConfig={{
              gutter: false,
            }}
            a={{
              defaultValue: oldValue,
              extensions,
              options: {
                editable: false,
                readOnly: true,
              },
            }}
            b={{
              defaultValue: newValue,
              extensions,
              options: {
                editable: false,
                readOnly: true,
              },
            }}
            didMount={({ a }) => {
              editorRef.current = a
            }}
          />
        </div>
      </EditorProvider>
    </div>
  </>
}

export default Page
