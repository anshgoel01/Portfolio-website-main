import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const About = () => {
  const { ref: aboutRef, isVisible: aboutVisible } = useScrollAnimation();

  const skills = {
    languages: [
      "Java",
      "Python",
      "C++",
      "JavaScript",
      "TypeScript",
      "SQL",
      "HTML",
      "CSS",
    ],
    webdev: [
      "React",
      "Node.js",
      "Express.js",
      "FastAPI",
      "Flask",
      "Tailwind CSS",
      "REST APIs",
      "WebSockets",
      "JWT Authentication",
    ],
    databases: [
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Redis",
      "Supabase",
      "pgvector",
      "Docker",
      "AWS",
      "Git",
      "GitHub",
    ],
    ai: [
      "LangGraph",
      "TensorFlow",
      "PyTorch",
      "Whisper",
      "Matplotlib",
      "Plotly",
    ],
    coreCs: [
      "Data Structures & Algorithms",
      "OOP",
      "Operating Systems",
      "DBMS",
      "Computer Networks",
      "System Design (LLD)",
      "Agile Methodologies",
    ],
  };

  return (
    <section id="about" ref={aboutRef} className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <div className={`space-y-8 ${aboutVisible ? "scroll-animate" : ""}`}>
            <div>
              {/* <p className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                About Me
              </p> */}
              <h2 className="text-5xl font-bold mb-8">My background</h2>
            </div>

            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                I'm a{" "}
                <span className="font-bold text-black dark:text-white">
                  Final Year Computer Science Engineering Student
                </span>{" "}
                at Thapar Institute of Engineering & Technology. I'm a
                full-stack developer with experience in building scalable
                and secure systems. I've gained hands-on experience as a
                Software Engineering Intern at SafeSpace, where I
                developed advanced multimodal stress detection systems.
              </p>

              <p>
                My work lies at the intersection of high-performance software
                engineering and applied AI. I've built full stack platforms like
                VerifyHub, engineering a serverless verification system that has
                processed{" "}
                <span className="font-bold text-black dark:text-white">
                  12,000+ project submissions
                </span>
                , delivering
                sub-{" "}
                <span className="font-bold text-black dark:text-white">
                  5 second{" "}
                </span>
                verification through automated scraping, real-time
                validation, and scalable backend workflows. I am passionate about
                building scalable, secure, and intelligent systems.
              </p>

              <p>
                What truly drives me is solving real-world problems with
                measurable impact. Whether it's optimizing distributed systems,
                architecting secure platforms, or building AI models that
                enhance human well-being, I approach every challenge with
                precision, curiosity, and a strong focus on delivering results
                that matter.
              </p>
            </div>
          </div>

          {/* Right Content - Skills Card */}
          <div
            className={`glass-card rounded-3xl p-8 shadow-xl ${aboutVisible ? "scroll-animate scroll-animate-delay-2" : ""}`}
          >
            <h3 className="text-2xl font-bold mb-8">Skills & Expertise</h3>

            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
              {[
                { heading: "Languages", items: skills.languages },
                { heading: "AI & ML", items: skills.ai },
                { heading: "Web Development", items: skills.webdev },
                { heading: "Databases & Tools", items: skills.databases },
                { heading: "Core CS", items: skills.coreCs, full: true },
              ].map(({ heading, items, full }) => (
                <div key={heading} className={full ? "sm:col-span-2" : undefined}>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
                    {heading}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 text-black dark:text-white rounded-full text-xs font-medium border border-border hover:border-black dark:hover:border-white transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
