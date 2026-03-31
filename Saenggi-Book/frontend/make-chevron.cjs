const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'reports', 'ai-evaluation-detail.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Replace NavigationCard Definition
const oldNavCardPattern = /function NavigationCard\(\{ value, title, icon, score, subtitle, colorClass \}: any\) \{[\s\S]*?<\/TabsTrigger>\s*\}/;

const newNavCard = `function NavigationCard({ value, title, icon, score, colorClass, isActive, isFirst, isLast, zIndex }: any) {
  return (
    <TabsTrigger 
       value={value}
       className={\`relative flex flex-col items-center justify-center gap-1 py-2 md:py-3 px-6 md:px-8 cursor-pointer font-bold transition-all duration-300 outline-none select-none border-none whitespace-nowrap min-w-[75px] md:min-w-[120px] 
         \${isActive 
           ? 'text-white shadow-xl shadow-slate-300/50 scale-[1.03] z-[100]' 
           : 'bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800 z-10'
       }\`}
       style={{
         background: isActive ? colorClass.hex : undefined,
         clipPath: isFirst 
           ? 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)'
           : isLast
           ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 16px 50%)'
           : 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)',
         marginLeft: isFirst ? '0px' : '-8px',
         zIndex: isActive ? 100 : zIndex,
         borderTopLeftRadius: isFirst ? '12px' : '0',
         borderBottomLeftRadius: isFirst ? '12px' : '0',
         borderTopRightRadius: isLast ? '12px' : '0',
         borderBottomRightRadius: isLast ? '12px' : '0'
       }}
    >
       <div className={\`flex items-center gap-1 md:gap-2 \${isActive ? 'opacity-100' : 'opacity-80'}\`}>
          <span className="text-[14px] md:text-lg drop-shadow-sm">{icon}</span>
          <span className={\`text-[12px] md:text-[14px] \${isActive ? '' : 'font-semibold'}\`}>{title}</span>
       </div>
       <span className={\`text-[14px] md:text-xl font-black mt-0.5 \${isActive ? 'bg-white/20 px-1.5 md:px-2 py-0.5 rounded backdrop-blur-sm -ml-1' : ''}\`}>
         {score}<span className="text-[10px] md:text-xs ml-0.5 opacity-90">점</span>
       </span>
    </TabsTrigger>
  );
}`;

content = content.replace(oldNavCardPattern, newNavCard);

// 2. Replace the TabsList section inside AiEvaluationDetail
const tabsListPattern = /<TabsList className="flex w-full md:w-\[280px\] h-auto p-0 bg-transparent gap-3 pb-4">[\s\S]*?<\/TabsList>/;

const newTabsList = `<TabsList className="relative flex w-full max-w-4xl mx-auto overflow-x-auto h-auto p-0 bg-transparent mb-6 rounded-xl scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] drop-shadow-sm pb-8 pt-4 border-none">
          <NavigationCard 
            value="overview" title="종합" icon="👑" score={totalScore} isFirst={true} isLast={false} zIndex={50} isActive={activeTab === 'overview'}
            colorClass={{ hex: '#4f46e5' }}
          />
          <NavigationCard 
            value="academic" title="학업" icon="📚" score={scores.academic} isFirst={false} isLast={false} zIndex={40} isActive={activeTab === 'academic'}
            colorClass={{ hex: '#3b82f6' }}
          />
          <NavigationCard 
            value="career" title="진로" icon="🎯" score={scores.career} isFirst={false} isLast={false} zIndex={30} isActive={activeTab === 'career'}
            colorClass={{ hex: '#10b981' }}
          />
          <NavigationCard 
            value="community" title="공동체" icon="🤝" score={scores.community} isFirst={false} isLast={false} zIndex={20} isActive={activeTab === 'community'}
            colorClass={{ hex: '#f59e0b' }}
          />
          <NavigationCard 
            value="other" title="기타" icon="✨" score={scores.other} isFirst={false} isLast={true} zIndex={10} isActive={activeTab === 'other'}
            colorClass={{ hex: '#8b5cf6' }}
          />
        </TabsList>`;

content = content.replace(tabsListPattern, newTabsList);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Chevron tab applied successfully.');
