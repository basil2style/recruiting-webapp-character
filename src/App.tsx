import React, { useState, useEffect } from 'react';
import { Character } from './types';

// Constants
const ATTRIBUTE_LIST = [
  "Strength",
  "Dexterity", 
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma"
];

const CLASS_LIST = [
  { name: "Barbarian", minimums: { Strength: 14, Constitution: 12 } },
  { name: "Bard", minimums: { Charisma: 14, Dexterity: 12 } },
  { name: "Cleric", minimums: { Wisdom: 14, Charisma: 12 } },
  { name: "Druid", minimums: { Wisdom: 14, Constitution: 12 } },
  { name: "Fighter", minimums: { Strength: 14, Constitution: 12 } },
  { name: "Monk", minimums: { Dexterity: 14, Wisdom: 12 } },
  { name: "Paladin", minimums: { Strength: 14, Charisma: 14 } },
  { name: "Ranger", minimums: { Dexterity: 14, Wisdom: 12 } },
  { name: "Rogue", minimums: { Dexterity: 14, Intelligence: 12 } },
  { name: "Sorcerer", minimums: { Charisma: 14, Constitution: 12 } },
  { name: "Warlock", minimums: { Charisma: 14, Wisdom: 12 } },
  { name: "Wizard", minimums: { Intelligence: 14, Wisdom: 12 } }
];

const SKILL_LIST = [
  { name: "Acrobatics", attribute: "Dexterity" },
  { name: "Animal Handling", attribute: "Wisdom" },
  { name: "Arcana", attribute: "Intelligence" },
  { name: "Athletics", attribute: "Strength" },
  { name: "Deception", attribute: "Charisma" },
  { name: "History", attribute: "Intelligence" },
  { name: "Insight", attribute: "Wisdom" },
  { name: "Intimidation", attribute: "Charisma" },
  { name: "Investigation", attribute: "Intelligence" },
  { name: "Medicine", attribute: "Wisdom" },
  { name: "Nature", attribute: "Intelligence" },
  { name: "Perception", attribute: "Wisdom" },
  { name: "Performance", attribute: "Charisma" },
  { name: "Persuasion", attribute: "Charisma" },
  { name: "Religion", attribute: "Intelligence" },
  { name: "Sleight of Hand", attribute: "Dexterity" },
  { name: "Stealth", attribute: "Dexterity" },
  { name: "Survival", attribute: "Wisdom" }
];

const CharacterSheet = () => {
  const [characters, setCharacters] = useState([
    {
      id: 1,
      name: "Character 1",
      attributes: {
        Strength: 10,
        Dexterity: 10,
        Constitution: 10,
        Intelligence: 10,
        Wisdom: 10,
        Charisma: 10
      },
      skills: SKILL_LIST.reduce((acc, skill) => {
        acc[skill.name] = 0;
        return acc;
      }, {}),
      selectedClass: null
    }
  ]);
  
  const [skillCheck, setSkillCheck] = useState({
    skill: SKILL_LIST[0].name,
    dc: 20,
    characterId: 1,
    result: null,
    roll: null
  });
  
  const [partySkillCheck, setPartySkillCheck] = useState({
    skill: SKILL_LIST[0].name,
    dc: 20,
    result: null,
    roll: null,
    characterId: null
  });

  // Calculate attribute modifier
  const calculateModifier = (attributeValue) => {
    return Math.floor((attributeValue - 10) / 2);
  };

  // Check if a character meets class requirements
  const meetsClassRequirements = (character, className) => {
    const classObj = CLASS_LIST.find(c => c.name === className);
    if (!classObj) return false;
    
    for (const [attribute, minimum] of Object.entries(classObj.minimums)) {
      if (character.attributes[attribute] < minimum) {
        return false;
      }
    }
    return true;
  };

  // Calculate total available skill points
  const calculateAvailableSkillPoints = (character) => {
    const intModifier = calculateModifier(character.attributes.Intelligence);
    return 10 + (4 * intModifier);
  };

  // Calculate used skill points
  const calculateUsedSkillPoints = (character: Character): number => {
    return Object.values(character.skills).reduce((sum: number, points: number) => sum + points, 0);
  };

  // Calculate total skill value
  const calculateSkillTotal = (character, skillName) => {
    const skill = SKILL_LIST.find(s => s.name === skillName);
    if (!skill) return 0;
    
    const attributeModifier = calculateModifier(character.attributes[skill.attribute]);
    return character.skills[skillName] + attributeModifier;
  };

  // Handle attribute change
  const handleAttributeChange = (characterId, attribute, value) => {
    setCharacters(prevCharacters => {
      return prevCharacters.map(character => {
        if (character.id !== characterId) return character;
        
        // Calculate total attributes after the change
        const totalAttributesBeforeChange = Object.values(character.attributes).reduce((sum, val) => sum + val, 0);
        const change = value - character.attributes[attribute];
        const totalAttributesAfterChange = totalAttributesBeforeChange + change;
        
        // Check if we exceed the maximum of 70
        if (totalAttributesAfterChange > 70) {
          return character;
        }
        
        // Check minimum
        if (value < 1) {
          return character;
        }
        
        return {
          ...character,
          attributes: {
            ...character.attributes,
            [attribute]: value
          }
        };
      });
    });
  };

  // Handle skill point allocation
  const handleSkillChange = (characterId, skillName, value) => {
    setCharacters(prevCharacters => {
      return prevCharacters.map(character => {
        if (character.id !== characterId) return character;
        
        // Don't allow negative skill points
        if (value < 0) return character;
        
        // Calculate how many points this change would use
        const currentPoints = character.skills[skillName];
        const pointDifference = value - currentPoints;
        
        // Check if we have enough points remaining
        if (pointDifference > 0 && pointDifference > (calculateAvailableSkillPoints(character) - calculateUsedSkillPoints(character))) {
          return character;
        }
        
        return {
          ...character,
          skills: {
            ...character.skills,
            [skillName]: value
          }
        };
      });
    });
  };

  // Handle class selection
  const handleClassSelect = (characterId, className) => {
    setCharacters(prevCharacters => {
      return prevCharacters.map(character => {
        if (character.id !== characterId) return character;
        return {
          ...character,
          selectedClass: className === character.selectedClass ? null : className
        };
      });
    });
  };

  // Perform skill check
  const performSkillCheck = () => {
    const character = characters.find(c => c.id === skillCheck.characterId);
    if (!character) return;
    
    const roll = Math.floor(Math.random() * 20) + 1; // 1-20
    const skillTotal = calculateSkillTotal(character, skillCheck.skill);
    const total = roll + skillTotal;
    const success = total >= skillCheck.dc;
    
    setSkillCheck(prev => ({
      ...prev,
      roll,
      result: success ? 'Success' : 'Failure'
    }));
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Skill Check Section (at the top) */}
        <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-center">Skill Check</h2>
          <div className="flex justify-center items-center space-x-4">
            <div className="flex items-center">
              <label className="mr-2">Skill:</label>
              <select 
                className="bg-gray-700 text-white p-2 rounded border border-gray-600"
                value={skillCheck.skill}
                onChange={(e) => setSkillCheck(prev => ({ ...prev, skill: e.target.value }))}
              >
                {SKILL_LIST.map(skill => (
                  <option key={skill.name} value={skill.name}>{skill.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="mr-2">DC:</label>
              <input 
                type="number" 
                className="bg-gray-700 text-white p-2 w-20 rounded border border-gray-600"
                value={skillCheck.dc}
                onChange={(e) => setSkillCheck(prev => ({ ...prev, dc: parseInt(e.target.value) || 0 }))}
                min="1"
              />
            </div>
            <button 
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-1 rounded"
              onClick={performSkillCheck}
            >
              Roll
            </button>
          </div>
          
          {skillCheck.result && (
            <div className="mt-4 p-3 bg-gray-700 rounded text-center">
              <p>
                Rolled: {skillCheck.roll} + 
                Skill: {calculateSkillTotal(characters.find(c => c.id === skillCheck.characterId), skillCheck.skill)} = 
                {skillCheck.roll + calculateSkillTotal(characters.find(c => c.id === skillCheck.characterId), skillCheck.skill)}
              </p>
              <p className={skillCheck.result === 'Success' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                {skillCheck.result}!
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Attributes Section */}
          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-center">Attributes</h2>
            <div className="space-y-2">
              {ATTRIBUTE_LIST.map(attribute => {
                const character = characters[0]; // For simplicity, just using the first character
                const value = character.attributes[attribute];
                const modifier = calculateModifier(value);
                
                return (
                  <div key={attribute} className="flex justify-between items-center">
                    <span>{attribute}: {value}(Modifier: {modifier})</span>
                    <div className="flex space-x-1">
                      <button 
                        className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded border border-gray-600"
                        onClick={() => handleAttributeChange(character.id, attribute, value - 1)}
                      >
                        -
                      </button>
                      <button 
                        className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded border border-gray-600"
                        onClick={() => handleAttributeChange(character.id, attribute, value + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Classes Section */}
          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-center">Classes</h2>
            <div className="flex flex-col space-y-1">
              {CLASS_LIST.map(classObj => {
                const character = characters[0]; // For simplicity
                const meetsRequirements = meetsClassRequirements(character, classObj.name);
                
                return (
                  <div 
                    key={classObj.name}
                    className={`p-1 text-center cursor-pointer ${
                      !meetsRequirements ? 'text-red-400' : 'text-gray-400'
                    } ${character.selectedClass === classObj.name ? 'bg-gray-700' : ''}`}
                    onClick={() => handleClassSelect(character.id, classObj.name)}
                  >
                    {classObj.name}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Class Requirements Section */}
          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-center">
              {characters[0].selectedClass ? `${characters[0].selectedClass} Minimum Requirements` : 'Class Requirements'}
            </h2>
            <div className="space-y-2">
              {characters[0].selectedClass && Object.entries(CLASS_LIST.find(c => c.name === characters[0].selectedClass)?.minimums || {}).map(([attribute, minimum]) => (
                <div key={attribute} className="flex justify-between items-center">
                  <span>{attribute}: {minimum}</span>
                  <span className={characters[0].attributes[attribute] < minimum ? 'text-red-400' : ''}>
                    Current: {characters[0].attributes[attribute]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Skills Section */}
          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-center">Skills</h2>
            <p className="mb-2 text-center">
              Total skill points available: {calculateAvailableSkillPoints(characters[0])}
            </p>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {SKILL_LIST.map(skill => {
                const character = characters[0]; // For simplicity
                const points = character.skills[skill.name];
                const attributeModifier = calculateModifier(character.attributes[skill.attribute]);
                const total = points + attributeModifier;
                
                return (
                  <div key={skill.name} className="flex justify-between items-center">
                    <span>
                      {skill.name}: {points}(Modifier: {skill.attribute}): {attributeModifier}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button 
                        className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded border border-gray-600"
                        onClick={() => handleSkillChange(character.id, skill.name, points - 1)}
                      >
                        -
                      </button>
                      <button 
                        className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded border border-gray-600"
                        onClick={() => handleSkillChange(character.id, skill.name, points + 1)}
                      >
                        +
                      </button>
                      <span className="ml-1">total: {total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
